![JMC — Streamline Attendance and Library Management](public/images/jmc-readme-banner.png)

# JMC — Attendance + Library Management

Combined system for **JOSE MARIA COLLEGE Foundation Inc.**: school attendance (BCCI-PANTAS lineage) and full library management (USM lineage) in one Laravel app.

- **Attendance patrons** and **library patrons** are stored in **separate** tables.
- Staff use **Spatie roles**: `library_admin`, `library_staff`, `attendance_admin`, `attendance_staff`, `super_admin`.
- **Frontend:** Inertia.js + React + TypeScript + **shadcn/ui** (Radix + Tailwind 4) for auth, registration, attendance, and library admin.
- **Accessibility:** the active React interface targets WCAG 2.2 AA with keyboard-safe dialogs and menus, visible focus, reduced-motion support, semantic status feedback, and accessible form errors.

Progress tracker: [`documentation/taskmd.md`](documentation/taskmd.md)

## Requirements

- PHP 8.2+
- MySQL 8+
- Node.js 20+
- Composer 2

## Setup

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan storage:link
```

`db:seed` loads sample data ported from USM and BCCI-PANTAS:

| Domain | Sample data |
|--------|-------------|
| Library | 6 programs, 170 courses, 10 students, 12 employees, 18 book copies, circulation logs, fines policy, 4 rooms, 15 feedback |
| Attendance | 5 programs, 5 students, 5 employees, 54 scan logs, kiosk sections, 7 feedback |

**Test QR codes (attendance kiosk `/attendance`):** `AS-00000001` … `AS-00000005`  
**Library patrons (circulation):** `S-00000001` … `S-00000010` (separate from attendance)

Configure MySQL in `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=jmc
DB_USERNAME=root
DB_PASSWORD=
```

Optional SMS modem for scan notifications:

```env
SMS_MODEM_URL=
```

## Run locally

```bash
composer run dev
```

Or separately: `php artisan serve` and `npm run dev`.

## Seeded staff accounts

Password for all: `password`

| Role | Email |
|------|-------|
| library_admin | library_admin@jmc.test |
| library_staff | library_staff@jmc.test |
| attendance_admin | attendance_admin@jmc.test |
| attendance_staff | attendance_staff@jmc.test |
| super_admin | super_admin@jmc.test |

## Key routes

| URL | Purpose |
|-----|---------|
| `/login` | Staff login |
| `/register` | Public patron registration (attendance or library) |
| `/attendance` | Public attendance kiosk |
| `/opac` | Public library catalog |
| `/dashboard/*` | Role-specific Inertia dashboards |
| `POST /switch-module` | Authenticated module switch action used by the workspace modal |
| `/files` | Library document repository |
| `/students`, `/employees`, `/pending`, `/logs` | Library admin (Inertia + shadcn) |
| `/ebooks`, `/admin/catalog-frameworks`, `/admin/catalog-select-options` | Library catalog admin tools |
| `/admin/activities`, `/reports/library-holdings` | Library activity + holdings reports |

## Staff workspaces

Module switching is handled through a modal in the authenticated application shell; there is no standalone module-selection page.

- Staff with one assigned module go directly to its dashboard.
- Staff with both Attendance and Library roles default to Attendance after login and can switch between their authorized modules.
- Super administrators can switch between Attendance, Library, and the Super Admin Dashboard.
- The server validates every switch request; a user cannot open a module that their roles do not permit.

## Library navigation hierarchy

Library shell (`LibraryLayout`) now uses config-driven grouped navigation with role-aware filtering and breadcrumbs:

- Home
- Catalog
- Circulation
- Patrons
- Rooms
- Reports
- Admin

## shadcn/ui

Components live in `resources/js/components/ui/`. Add more with:

```bash
npx shadcn@latest add <component>
```

JMC brand tokens are in `resources/css/app.css` (blue `#1f4ea7`, green `#2e7d32`, gold `#ffd700`).

The product and design decisions used by coding agents are documented in [`PRODUCT.md`](PRODUCT.md) and [`DESIGN.md`](DESIGN.md).

## Verification

```bash
php artisan db:seed
php artisan test
npm run test:unit
npx tsc --noEmit
npm run build
./vendor/bin/pint
```

## Documentation

- Auth flow: `documentation/authfolow.md`
- Registration flow: `documentation/patronregistrationflow.md`
- Product context: `PRODUCT.md`
- Frontend design system: `DESIGN.md`
- Task tracker: `documentation/taskmd.md`
- Agent guide: `AGENTS.md`
