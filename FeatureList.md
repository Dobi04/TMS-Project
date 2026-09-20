# Feature list: Audit Log (TMS project)

Context for Copilot: solution is layered .NET 8 (`TMS.API` → `TMS.Application` → `TMS.Domain` / `TMS.Infrastructure`), EF Core + MySQL, JWT-cookie auth with roles `Guest`, `ProductionOperator`, `BusinessUnitLeader`, `QualitySupervisor`. Frontend is React + TypeScript + Vite + Tailwind, with `axios`-based `apiClient`, route guards in `components/ProtectedRoute`, and an existing **placeholder** page at `frontend/src/pages/AuditLogPage.tsx` already routed at `/audit-log` and gated to `QualitySupervisor` in `App.tsx` and `navigation.ts`. There is currently **no** audit logging anywhere in the codebase — this is a net-new feature end to end.

Goal: every create/update/delete (and optionally login) action on `Tyre`, `Sales`, `User`, `Machine` gets recorded as an immutable audit entry, queryable only by `QualitySupervisor` (and maybe `BusinessUnitLeader` read-only), and rendered in `AuditLogPage.tsx`.

---

## 1. Domain layer — `TMS.Domain`

- [ ] Add `AuditAction` enum (`TMS.Domain/Enums/AuditAction.cs`): `Create = 0, Update = 1, Delete = 2, Login = 3, LoginFailed = 4`.
- [ ] Add `AuditLog` entity (`TMS.Domain/Entities/AuditLog.cs`) following existing entity style (public props, no data annotations, defaults set in-line):
  - `Id` (int)
  - `EntityName` (string) — e.g. `"Tyre"`, `"Sales"`, `"User"`, `"Machine"`
  - `EntityId` (string) — string so it can hold non-int keys later
  - `Action` (`AuditAction`)
  - `UserId` (int?) — nullable, actor may be null for system actions
  - `Username` (string) — denormalized snapshot so the log stays readable even if the user is later deleted/renamed
  - `Timestamp` (DateTime, default `DateTime.UtcNow`)
  - `OldValues` (string?) — JSON snapshot before change
  - `NewValues` (string?) — JSON snapshot after change
  - `IpAddress` (string?)
  - Do **not** add an `isActive` soft-delete flag — audit rows must be immutable and undeletable.

## 2. Persistence — `TMS.Infrastructure`

- [ ] Add `DbSet<AuditLog> AuditLogs` to `AppDbContext`.
- [ ] Add `AuditLogConfiguration.cs` under `Persistence/Configurations/`, mirroring `TyreConfiguration.cs`/`SalesConfiguration.cs` style: max lengths on `EntityName`/`EntityId`/`Username`/`IpAddress`, index on `(EntityName, EntityId)` and on `Timestamp` for fast filtering.
- [ ] Add `IAuditLogRepository` in `TMS.Application/Interfaces/Repositories/` matching the existing repo interface shape (`FindByIdAsync`, `GetAllAsync` with filter params, `AddAsync`, `SaveChangesAsync`) — no update/delete methods, to enforce immutability at the interface level.
- [ ] Implement `AuditLogRepository` under `Persistence/Configurations/Repositories/`, same pattern as `TyreRepository`/`SalesRepository`.
- [ ] Register `IAuditLogRepository → AuditLogRepository` in `TMS.Infrastructure/DependencyInjection.cs`.
- [ ] Add EF Core migration `AddAuditLogTable` (`dotnet ef migrations add AddAuditLogTable -p TMS.Infrastructure -s TMS.API`).

## 3. Capture mechanism — pick ONE approach and apply consistently

**Recommended: `SaveChanges` interceptor**, since it captures every entity change automatically without touching every service.

- [ ] Add `AuditSaveChangesInterceptor : SaveChangesInterceptor` in `TMS.Infrastructure/Persistence/`:
  - On `SavingChangesAsync`, walk `ChangeTracker.Entries()` for `Added`/`Modified`/`Deleted` states.
  - Skip the `AuditLog` entity itself (avoid recursive logging).
  - For `Modified`, only serialize properties whose `IsModified` is true into `OldValues`/`NewValues` (avoid noisy full-row diffs).
  - Pull current user id/username from an injected `ICurrentUserService` (see below) — do not read `HttpContext` directly inside `TMS.Infrastructure`.
  - Queue the constructed `AuditLog` rows and call `AuditLogs.AddRangeAsync` before calling `base.SavingChangesAsync`.
- [ ] Add `ICurrentUserService` interface in `TMS.Application/Interfaces/` (`UserId`, `Username`, `IpAddress`) and implement `CurrentUserService` in `TMS.API` (or `TMS.Infrastructure`) backed by `IHttpContextAccessor`.
- [ ] Register `IHttpContextAccessor` and `ICurrentUserService` in DI; register the interceptor via `options.AddInterceptors(...)` in `AddInfrastructure`.
- [ ] Explicitly decide whether `User` entity changes get audited (recommended: yes for `Role`/`isActive`/`isEmailVerified` changes, but never log `PasswordHash` value — redact it to `"***"` in the snapshot).

*(Alternative if you prefer not to use an interceptor: log explicitly inside `TyreService`/`SalesService`/`AuthServices` after each `SaveChangesAsync` call. More boilerplate, but simpler to reason about per-action. Pick this only if the interceptor approach turns out to fight the current unit-of-work pattern.)*

## 4. Application layer — `TMS.Application`

- [ ] Add DTOs under `TMS.Application/DTOs/AuditLogDTOs/`:
  - `AuditLogResponseDTO` (Id, EntityName, EntityId, Action, UserId, Username, Timestamp, OldValues, NewValues, IpAddress)
  - `AuditLogFilterDTO` (optional query params: `EntityName`, `UserId`, `Action`, `DateFrom`, `DateTo`, `Page`, `PageSize`) — used for the "GetAll" endpoint so the frontend can filter/paginate.
- [ ] Add `IAuditLogServices` interface (`GetAllAsync(AuditLogFilterDTO filter)`, `GetByEntityAsync(string entityName, string entityId)`).
- [ ] Implement `AuditLogService : IAuditLogServices` in `TMS.Application/Services/`, same constructor-injection style as `TyreService`. Include pagination (return total count + page of results) since audit tables grow indefinitely.
- [ ] Register `IAuditLogServices → AuditLogService` in `TMS.Application/DependencyInjection.cs`.

## 5. API layer — `TMS.API`

- [ ] Add `AuditLogController` under `Controllers/`, same shape as `TyreController`:
  - `[ApiController] [Authorize] [EnableRateLimiting("api")] [Route("api/[controller]")]`
  - `GET /api/AuditLog` — `[Authorize(Roles = "QualitySupervisor")]`, accepts `AuditLogFilterDTO` as query params, returns paginated `AuditLogResponseDTO` list.
  - `GET /api/AuditLog/entity/{entityName}/{entityId}` — same role, returns full history for one record (useful for a "view history" button on Tyre/Sales edit screens later).
  - No `POST`/`PUT`/`DELETE` endpoints — audit logs are written only by the interceptor, never via API.
- [ ] Decide + document read access for `BusinessUnitLeader` (currently only `QualitySupervisor` sees `/audit-log` per `navigation.ts`) — if BUL should get read-only access, add a second `[Authorize(Roles = "QualitySupervisor,BusinessUnitLeader")]` variant or query param, otherwise leave as-is.
- [ ] Also log auth events (optional but recommended for a real audit trail): call the audit service (or interceptor won't catch this since login doesn't necessarily mutate `User`) from `AuthServices`/`AuthController` on login success/failure to record `Action = Login/LoginFailed` with the attempted username and IP.

## 6. Frontend — `frontend/src`

- [ ] Add `types/auditLog.ts` (or wherever other DTO-mirroring types live) matching `AuditLogResponseDTO`.
- [ ] Add `api/auditLog.ts` (or extend existing `api/client.ts` usage pattern) with `getAuditLogs(filter)` and `getEntityHistory(entityName, entityId)` calls via `apiClient`.
- [ ] Replace the placeholder `AuditLogPage.tsx` with:
  - A filter bar (entity type dropdown, action dropdown, date range, user search) matching the visual style already used (`border-t-4 border-[#f5c400]`, `text-[#183b70]` headings, Tailwind utility classes consistent with other pages like `ProductionHistoryPage.tsx`/`SaleHistoryPage.tsx`).
  - A paginated table: Timestamp, Entity, Entity Id, Action (badge-styled per action type), User, and an expandable row or "diff" modal showing `OldValues` vs `NewValues` (pretty-printed JSON or a computed field-by-field diff).
  - Loading/empty/error states consistent with other list pages in the app.
- [ ] Confirm route guard: `App.tsx` already wraps `/audit-log` in `RequireQualitySupervisor` — no change needed unless BUL access is added, in which case add a `RequireQualitySupervisorOrBusinessUnitLeader` guard alongside the existing ones in `components/ProtectedRoute`.