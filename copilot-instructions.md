# Copilot Instructions — TMS (Big-Project)

Ovaj fajl daje GitHub Copilotu kontekst o arhitekturi, konvencijama i dizajn sistemu
projekta, kako bi generisani kod bio konzistentan sa postojećim kodom.

## O projektu

TMS je SaaS aplikacija za planiranje i praćenje ekskurzija/putovanja.
Monorepo sa tri glavna dela:

- `backend/` — .NET 10 Web API, Clean Architecture (4 sloja)
- `frontend/` — React 19 + TypeScript + Vite + Tailwind CSS v4
- `docker/` — MySQL master–slave replikacija (master, slave1, slave2) + `docker-compose.yml`

## Backend (.NET 10, Clean Architecture)

Struktura projekta prati strogu podelu na slojeve — **nikad ne preskači slojeve**
(npr. Controller ne sme direktno da zove Infrastructure ili DbContext).

```
TMS.API             -> Controllers, Program.cs, konfiguracija, DI kompozicija
TMS.Application     -> DTOs, Interfaces, Services (poslovna logika)
TMS.Domain          -> Entities, Enums (bez zavisnosti od drugih slojeva)
TMS.Infrastructure  -> EF Core (AppDbContext, Migrations, Configurations),
                                  Repositories, Security (JWT, hashing), EmailVerification
```

Zavisnosti idu ka unutra: `API -> Application -> Domain`, a `Infrastructure` implementira
interfejse definisane u `Application/Interfaces`. Svaki sloj ima svoj `DependencyInjection.cs`
sa `AddApplication()` / `AddInfrastructure()` extension metodama koje se pozivaju iz `Program.cs`.

### Konvencije imenovanja

- Interfejsi: `I` prefiks (`IUserRepository`, `IJwtTokenGenerator`, `IPasswordHasher`, `IAuthServices`).
- Servisi: implementacija interfejsa, sufiks `Services`/`Service` (`AuthServices`).
- DTO-ovi: sufiks `DTO`, grupisani u podfoldere po feature-u (`DTOs/AuthDTOs`, `DTOs/EmailVerificationDTOs`).
- Async metode: sufiks `Async` (`LoginAsync`, `RegisterAsync`, `SaveChangesAsync`).
- Namespace prati putanju foldera (`TMS.Application.Services`, itd.).
- `Nullable` i `ImplicitUsings` su `enable` u svim projektima — koristi nullable-aware tipove (`string?`).

### Controller pattern

Kontroleri su tanki: pozivaju servis, hvataju domenske exception-e i mapiraju ih u HTTP status.
Prati postojeći obrazac kada dodaješ nove endpoint-e:

```csharp
[HttpPost("action")]
[EnableRateLimiting("auth")]
public async Task<IActionResult> Action(SomeDTO dto)
{
    try
    {
        var result = await _service.DoSomethingAsync(dto);
        return Ok(result);
    }
    catch (InvalidOperationException ex)
    {
        return BadRequest(new { message = ex.Message });
    }
    catch (UnauthorizedAccessException ex)
    {
        return Unauthorized(new { message = ex.Message });
    }
}
```

- `InvalidOperationException` -> `400 BadRequest`
- `UnauthorizedAccessException` -> `401 Unauthorized`
- Response telo greške je uvek `new { message = "..." }`.
- Auth-osetljivi endpoint-i imaju `[EnableRateLimiting("auth")]` (fixed window: 10 zahteva / min).

### Servisi i poslovna logika

- Poslovna logika ide u `Application/Services`, ne u kontroler.
- Konstruktor injection preko interfejsa (bez `[FromServices]` u metodama).
- Validacija postojanja/konflikata baca exception (`throw new InvalidOperationException(...)`,
  `throw new UnauthorizedAccessException(...)`) — servis ne vraća `null`/status kodove.
- Magic brojevi idu u `private const` (npr. `VerificationCodeValidityMinutes`).
- Vremena čuvaj u UTC (`DateTime.UtcNow`).

### Domain / Entities

- Entiteti u `Domain/Entities` su čisti POCO — bez EF/Infrastructure zavisnosti.
- String properties inicijalizuj sa `= string.Empty;` umesto null-a.
- Enume drži u `Domain/Enums` (npr. `Roles { Admin = 0, User = 1, Owner = 2 }`).

### Infrastructure / EF Core

- Baza: MySQL preko `Pomelo.EntityFrameworkCore.MySql`.
- `AppDbContext` i entity konfiguracije (`IEntityTypeConfiguration<T>`) žive u
  `Persistence/Configurations`; repozitorijumi u `Persistence/Configurations/Repositories`.
- Migracije se generišu standardno (`dotnet ef migrations add <ImeNaSrpskom>`) — primeti da
  se **imena migracija pišu na srpskom** (`InicijalnoKreiranje`, `DodajEmailVerifikaciju`) —
  drži se te konvencije za nove migracije.
- Sigurnost: lozinke hešira `PasswordHasher` (BCrypt), JWT generiše `JwtTokenGenerator`
  (`System.IdentityModel.Tokens.Jwt`), email šalje `SmtpEmailSender`.

### Autentifikacija

- JWT Bearer auth, `Jwt:Key` (min 32 bajta), `Jwt:Issuer`, `Jwt:Audience` iz konfiguracije —
  aplikacija baca na startu ako fale (fail-fast u `Program.cs`, ne default vrednosti).
- Email verifikacija: 6-cifreni kod (`RandomNumberGenerator.GetInt32`, format `D6`), važi
  5 minuta, čuva se `EmailVerificationCode` + `EmailVerificationCodeExpiry` na `User` entitetu.
- CORS politika `AllowFrontend` dozvoljava samo `http://localhost:5173` u dev-u — ažuriraj je
  kad se dodaje produkcioni frontend origin, ne ukidaj `AllowCredentials()`.

### Jezik u kodu vs. u porukama

- Identifikatori, komentari i tehnički tekst: **engleski**.
- Poruke korisniku (email sadržaj, verifikacione poruke, imena migracija): **srpski/mešano**,
  prati postojeći ton (npr. "Verifikacija naloga", "Tvoj verifikacioni kod je: ...").
- Kad ispravljaš postojeći tekst, popravi očigledne tipfelere (npr. "Serices" -> "Services",
  "pleace" -> "please") ali ne menjaj javni ugovor (nazive klasa/interfejsa) bez eksplicitnog
  zahteva, jer to je breaking change kroz više fajlova.

## Frontend (React 19 + TypeScript + Vite + Tailwind v4)

### Stack

- React 19, React Router DOM v7 (`useOutletContext` za prosleđivanje layout state-a stranicama).
- State: `zustand` za globalni state, lokalni `useState`/custom hooks za ostalo.
- HTTP: `axios` instanca iz `src/api/client.ts` (`apiClient`, `baseURL` iz `VITE_API_BASE_URL`) —
  uvek koristi ovaj klijent, ne kreiraj novi `axios.create(...)` po fajlu.
- Realtime: `@microsoft/signalr` je zavisnost — koristi je za bilo kakav "live tracking"/
  notifikacije feature umesto polling-a.
- Stilovi: isključivo Tailwind utility klase (nema CSS modula, nema styled-components).
- Linter: `oxlint` (`npm run lint`).

### Struktura foldera

```
src/
  api/          -> axios klijent i API pozivi
  components/   -> deljene komponente (npr. ProtectedRoute)
  features/     -> feature-specifične komponente (npr. features/auth/AuthModal)
  hooks/        -> custom hooks (useAuth, useTheme, useSidebar)
  layouts/      -> Header, MainLayout, sidebar/*
  lib/          -> pomoćne, bezstate funkcije (npr. themeClasses.ts)
  pages/        -> route-level komponente (HomePage, AdminPage, ExcursionsPage, ...)
```

Novi feature ide u `features/<ime>/`, nova ruta/stranica u `pages/`, deljena logika bez state-a
u `lib/`, stateful logika za ponovnu upotrebu u `hooks/`.

### Komponente — konvencije

- Funkcionalne komponente, `export default function ComponentName(...)`.
- Props tip definisan iznad komponente kao `type Props = { ... };`, nikad inline niti `interface`
  za props (projekat dosledno koristi `type`).
- Callback props imenovani `onX` (`onCloseMobile`, `onToggleCollapsed`, `onOpenAuth`), boolean
  props `isX`/`hasX` (`isMobileOpen`, `isCollapsed`, `isLoggedIn`).
- Za stranice koje zavise od layout-a: `useOutletContext<LayoutOutletContext | undefined>()`,
  sa fallback vrednošću (npr. `theme = outletContext?.theme ?? 'light'`).

### Dizajn sistem / theming

Aplikacija ima dark/light mod. Boje se **ne** hardkoduju direktno po komponentama — koristi se
jedan od dva obrasca koja već postoje u kodu:

1. **Centralizovano** preko `getThemeClasses(theme)` iz `lib/themeClasses.ts` — vraća objekat
   sa semantičkim ključevima (`shell`, `sidebar`, `border`, `subtleText`, `navLink`, `ghostButton`,
   `userPanel`, `logoutButton`, `headerBg`...). Koristi ovaj pristup za layout/strukturne delove
   (sidebar, header, navigacija). Kad dodaješ novi vizuelni deo koji layout deli, dodaj novi ključ
   u `getThemeClasses` umesto ad-hoc ternary-ja u komponenti.
2. **Inline `isDark` ternary** unutar same stranice/komponente (`isDark ? '...' : '...'`) — koristi
   se u `pages/*` za sadržaj specifičan za tu stranicu.

Nastavi da koristiš postojeću paletu i ne uvodi nove boje bez razloga:

- Pozadina (dark): `slate-950` / `slate-900`, (light): `slate-100` / `white`.
- Akcentna boja: **violet** (`violet-400`–`violet-600`, `violet-500/10`–`/20` za pozadine sa
  providnošću) — koristi se za primarne dugmiće, aktivne linkove, brend akcente.
- Semantičke boje: `emerald` za pozitivno/uspeh, `rose` za destruktivne akcije (logout, brisanje).
- Zaobljenja su namerno velika: `rounded-2xl`, `rounded-[26px]`, `rounded-[28px]` za kartice/
  kontejnere — ne koristi `rounded-md`/`rounded-lg` za glavne kartice.
- Tipografija: `font-black` za velike brojeve/naslove, `uppercase tracking-[0.2em]`/`[0.24em]`
  za male label-e iznad sadržaja.
- Tranzicije: `transition-all duration-300 ease-out` za sidebar/layout animacije.
- Mobile-first: sidebar i layout imaju eksplicitne `md:` breakpoint-e (mobile puna širina/overlay,
  desktop fiksna širina `md:w-72` / `md:w-20` kad je kolabovan).
- Font: `Inter` (fallback `'Segoe UI', sans-serif`), definisan globalno u `index.css`.

Kada Copilot generiše novu stranicu ili komponentu, treba da:
- podržava i dark i light temu (nikad samo jednu),
- koristi postojeću violet/slate/emerald/rose paletu, ne uvodi nove boje,
- prati postojeće razmere zaobljenja, spacing (`p-4`, `p-5`, `gap-2`/`gap-3`) i tipografske skale,
- bude responsive po istom mobile-first obrascu kao Sidebar/HomePage.

### LocalStorage / auth state na frontendu

`useAuth` hook čita `authToken`, `username`, `role` direktno iz `localStorage` (bez konteksta/
zustand store-a za sada) i eksponuje `{ username, role, isLogedIn, refresh, logout }`. Ako dodaješ
nove auth-vezane vrednosti, prati isti obrazac (čitanje iz `localStorage` + `refresh()` posle
login/register poziva), osim ako se eksplicitno migrira na zustand store.

## Infrastruktura / okruženje

- MySQL master–slave replikacija (`docker/master`, `docker/slave1`, `docker/slave2`) orkestrovana
  kroz `docker-compose.yml`; env varijable (`MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `REPL_USER`,
  `REPL_PASS`) dolaze iz `.env`, nikad hardkodovane vrednosti u compose fajlu.
- `.NET 10`, `Nullable` i `ImplicitUsings` uključeni — piši kod koji je nullable-safe.
- Frontend dev server: Vite na `localhost:5173` (usklađeno sa CORS politikom na backendu).

## Opšta pravila za Copilot

1. Pre nego što dodaš novi fajl, pogledaj postojeći fajl iz istog sloja/foldera kao referencu za
   stil (imenovanje, redosled using/import direktiva, format).
2. Ne uvodi nove biblioteke/pakete bez potrebe — proveri `package.json` / `.csproj` da li nešto
   ekvivalentno već postoji (npr. ne dodavati novi HTTP klijent kad postoji `apiClient`).
3. Ne menjaj arhitekturu slojeva (Clean Architecture na backendu, folder strukturu na frontendu)
   radi jednog feature-a — novi kod uklopi u postojeću strukturu.
4. Prati DTO/Service/Repository/Interface imenske konvencije tačno kao u postojećem kodu.
5. Za nove auth-osetljive endpoint-e uvek dodaj rate limiting i isti try/catch -> HTTP status
   mapping obrazac.
6. Za novi UI uvek podrži dark/light temu i koristi postojeću paletu i zaobljenja, ne izmišljaj
   novi vizuelni jezik.
