# TMS Project — Tyre Manufacturing / Management System

**TMS** is a full-stack system for tracking tyre production and sales (built with Michelin branding on the frontend), with clearly defined user roles, an audit log for all actions, and management reports. The backend is written in **.NET 10 / C#** (Clean Architecture), the frontend in **React 19 + TypeScript**, and data is stored in a **MySQL** database with master–slave replication (Docker).

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [User Roles & Access](#-user-roles--access)
- [Project Structure](#-project-structure)
- [API Overview](#-api-overview)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
  - [1. Database (Docker, master–slave replication)](#1-database-docker-masterslave-replication)
  - [2. Backend (.NET API)](#2-backend-net-api)
  - [3. Frontend (React)](#3-frontend-react)
- [Environment Variables (.env)](#-environment-variables-env)
- [Authentication](#-authentication)
- [Roadmap / Planned Features](#-roadmap--planned-features)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📖 About the Project

TMS provides:

- Tracking of tyre production by machine, shift, and operator
- Sales registration for tyres (by tyre code) with buyer and destination market details
- Machine management for the production floor
- Sales and production history views
- Summary reports (by day, shift, machine, operator, stock balance) for management
- An audit log of all critical actions in the system (create, update, delete, login, failed login)
- User registration and login with email code verification

---

## 🏗 Architecture

The backend follows a **Clean Architecture** approach, split into 4 layers:

```
TMS.Domain          → Entities and enums (pure business logic, no dependencies)
TMS.Application      → DTOs, interfaces, services (use-case layer)
TMS.Infrastructure   → EF Core, MySQL, JWT/security implementations, email verification
TMS.API              → ASP.NET Core Web API — controllers, authentication, Swagger
```

The frontend is a separate **React SPA** that communicates with the backend over a REST API (and SignalR for real-time functionality).

---

## 🛠 Tech Stack

**Backend**
- .NET 10 / C# (ASP.NET Core Web API)
- Entity Framework Core 9 + [Pomelo EF Core MySQL](https://github.com/PomeloFoundation/Pomelo.EntityFrameworkCore.MySql) provider
- MySQL (master–slave replication, 3 instances via Docker)
- JWT authentication (`Microsoft.AspNetCore.Authentication.JwtBearer`); the token is also accepted via an `authToken` cookie
- BCrypt.Net-Next for password hashing
- Rate limiting (separate policies for auth and general API calls)
- Swagger / OpenAPI (Swashbuckle) for API documentation in the development environment

**Frontend**
- React 19 + TypeScript
- Vite 8 (build tool)
- Tailwind CSS 4
- React Router DOM 7
- Zustand (state management)
- Axios (HTTP client)
- Microsoft SignalR client (real-time communication)
- oxlint (linter)

**Infrastructure**
- Docker / Docker Compose (MySQL master + 2 slave instances with replication)

---

## 👥 User Roles & Access

The system defines the following roles (`Roles` enum):

| Role | Description / Access |
|---|---|
| **Guest** | Default role before verification/rights are assigned |
| **ProductionOperator** | Logs tyre production (sees their own entries under "My Entries"), views machines |
| **QualitySupervisor** | Manages tyres (create, update, delete), registers sales, has access to sales/production history and the audit log — effectively acts as an admin |
| **BusinessUnitLeader** | Access to summary reports and a read-only view of all entries and sales |

Access to pages and API routes is enforced via `[Authorize(Roles = "...")]` attributes on the backend, and on the frontend through the `ProtectedRoute` component and role-based navigation visibility logic.

---

## 📁 Project Structure

```
TMS-Project/
├── backend/
│   └── src/
│       ├── TMS.API/              # Web API — Controllers, Program.cs, appsettings
│       │   └── Controllers/      # Auth, Machine, Sales, Tyre, Reports, AuditLog
│       ├── TMS.Application/      # DTOs, service interfaces
│       ├── TMS.Domain/           # Entities (User, Tyre, Sales, Machine, AuditLog...) and enums
│       └── TMS.Infrastructure/   # EF Core DbContext, migrations, security, email verification
├── frontend/
│   └── src/
│       ├── components/           # FilterBar, Pagination, SearchableSelect, ProtectedRoute...
│       ├── features/auth/        # AuthModal (login/registration)
│       ├── hooks/                # useAuth, usePagedQuery, useTheme...
│       ├── layouts/              # Header, MainLayout, Sidebar
│       ├── pages/                # HomePage, MyEntrysPage, SaleHistoryPage,
│       │                         # ProductionHistoryPage, AuditLogPage, SummaryReportsPage, AllEntriesPage
│       └── types/                # TypeScript types (tyre, sale, machine, auditLog, paged)
├── docker/                       # MySQL master/slave1/slave2 container configuration
├── docker-compose.yml            # MySQL replication orchestration
├── .env.example                  # Example environment variables (root/database)
└── README.md
```

---

## 🔌 API Overview

All endpoints are under the `api/[controller]` route and (except for `AuthController`) require JWT authentication.

| Controller | Endpoints (abbreviated) | Allowed Roles |
|---|---|---|
| **Auth** | `GET /me`, `POST /register`, `POST /login`, `POST /logout`, `POST /verify-email`, `POST /resend-code` | Public (except `/me`) |
| **Tyre** | `GET /mine`, `POST /`, `GET /`, `PUT /{id}`, `DELETE /{id}` | ProductionOperator / QualitySupervisor / BusinessUnitLeader (depends on route) |
| **Sales** | `GET /mine`, `POST /`, `GET /` | QualitySupervisor (write), BusinessUnitLeader (read) |
| **Machine** | `GET /` | ProductionOperator, QualitySupervisor |
| **Reports** | `production-by-day`, `production-by-shift`, `production-by-machine`, `production-by-operator`, `stock-balance` | BusinessUnitLeader |
| **AuditLog** | `GET /`, `GET /entity/{entityName}/{entityId}` | QualitySupervisor |

Full interactive documentation is available via **Swagger UI** when the backend is running in Development mode (`/swagger`).

---

## ✅ Prerequisites

- [.NET SDK 10](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) 20+ and npm
- [Docker](https://www.docker.com/) and Docker Compose (for the MySQL master–slave setup)

---

## 🚀 Getting Started

### 1. Database (Docker, master–slave replication)

From the project root:

```bash
cp .env.example .env
# fill in MYSQL_ROOT_PASSWORD, REPL_USER, REPL_PASS and the other values in .env

docker compose up -d
```

This spins up three MySQL containers:
- `mysql-master` (port `3306`) — the primary database the backend connects to
- `mysql-slave1` (port `3307`)
- `mysql-slave2` (port `3308`)

Master → slave replication is configured via `docker/setup-replication.sh`.

### 2. Backend (.NET API)

```bash
cd backend/src/TMS.API
```

Set up the connection string and JWT secrets (e.g. via `dotnet user-secrets`, `appsettings.Development.json`, or environment variables), following the root `.env.example`:

```
ConnectionStrings__DefaultConnection=Server=localhost;Port=3306;Database=tms_db;User=app;Password=<password>;
Jwt__Key=<random key, at least 32 characters>
Jwt__Issuer=MichelinTMS
Jwt__Audience=MichelinTMSUsers
Jwt__ExpiresInMinutes=60
```

Run migrations and start the app:

```bash
dotnet restore
dotnet ef database update --project ../TMS.Infrastructure --startup-project .
dotnet run
```

By default the backend expects the frontend at `http://localhost:5173` (CORS policy `AllowFrontend`), and the API itself runs on `https://localhost:7000` by default (check `launchSettings.json` / console output for the exact port).

### 3. Frontend (React)

```bash
cd frontend
cp .env.example .env
# set VITE_API_BASE_URL (defaults to https://localhost:7000)

npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🔐 Environment Variables (.env)

**Root `.env`** (for Docker/MySQL and the backend connection):

```
MYSQL_ROOT_PASSWORD=change-this-local-password
MYSQL_DATABASE=tms_db
ROOT_PASS=change-this-local-password
REPL_USER=repl
REPL_PASS=change-this-replication-password

ConnectionStrings__DefaultConnection=Server=localhost;Port=3306;Database=tms_db;User=app;Password=change-this-app-password;
Jwt__Key=replace-with-a-random-secret-at-least-32-characters-long
Jwt__Issuer=MichelinTMS
Jwt__Audience=MichelinTMSUsers
Jwt__ExpiresInMinutes=60
```

**Frontend `.env`**:

```
VITE_API_BASE_URL=https://localhost:7000
```

> ⚠️ Don't commit a real `.env` file with actual passwords/secrets — use `.env.example` as a template.

---

## 🔑 Authentication

- Registration goes through **email verification**: the user is first stored as a `PendingUserRegistration`, receives a code by email, and only becomes a real `User` after calling `verify-email`.
- Login (`/login`) issues a **JWT token**, sent either as an `Authorization: Bearer <token>` header or as an `authToken` HTTP-only cookie.
- Passwords are stored hashed using **BCrypt**.
- Sensitive routes (login/register) are protected by a rate-limiting policy (10 requests/min per IP address).

---

## 🧭 Roadmap / Planned Features

- [ ] Filtering and pagination (10 items per page, with an option to show 5 older/5 newer) for all tables, for all roles and pages — modeled after the Audit Log
- [ ] Register sales by tyre **Code** instead of the internal ID
- [ ] Validate the machine number on registration — check that the machine exists in the database (new machines can only be added by QualitySupervisor/admin), returning a 404 error if it doesn't exist

---

## 🤝 Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/feature-name`)
3. Commit your changes (`git commit -m "Add new feature"`)
4. Push the branch (`git push origin feature/feature-name`)
5. Open a Pull Request

---

**Repository:** [github.com/Dobi04/TMS-Project](https://github.com/Dobi04/TMS-Project)
