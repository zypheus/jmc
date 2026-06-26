# JMC — Task Tracker

> **Purpose:** Track active work, backlogs, and milestones during JMC development.  
> **Last updated:** 2026-06-26

---

## Plan status: **Complete + parity rollout done**

All seven implementation phases from the [JMC Combined System Plan](https://github.com/) are done:

| Phase | Scope | Status |
|-------|--------|--------|
| 0 | Foundation (Inertia, React, TS, shadcn, Spatie, MySQL) | Done |
| 1 | Auth/RBAC + role dashboards | Done |
| 2 | Dual patron registration | Done |
| 3 | Attendance MVP (kiosk, logs, reports, settings) | Done |
| 4 | Library core (patrons, catalog, circulation, fines) | Done |
| 5 | Library full (OPAC, rooms, files, MARC seeder, etc.) | Done |
| 6 | Super-admin staff management | Done |

**UI layer:** Library admin workflows migrated to **Inertia + shadcn/ui**. Dashboards, login, and layouts use JMC branding (blue/green/gold) similar to USM/BCCI.
USM-style parity shell is now active with config-driven grouped sidebar, role-aware dropdown items, and breadcrumb hierarchy.

### Sample data (`php artisan db:seed`)

17 seeders ported from `usm/database/seeders` and `BCCI-PANTAS/database/seeders`:

- **Library:** 6 programs, 170 courses, 10 students, 12 employees, 18 book copies, circulation samples, fines policy, 4 rooms, 15 feedback
- **Attendance:** 5 programs, 5 students, 5 employees, 54 scan logs, kiosk sections, 7 feedback

Test QR codes: attendance kiosk `AS-00000001`; library circulation `S-00000001` (separate patron domains).

---

## shadcn/ui components installed

`components.json` + Radix primitives. UI kit under `resources/js/components/ui/`:

| Component | Used for |
|-----------|----------|
| `button`, `input`, `label`, `textarea`, `checkbox` | Forms |
| `card` | Page sections |
| `table` | Patron lists, logs, fines |
| `tabs` | Pending queues, OPAC, edit requests |
| `dialog` | Fine clearance modal |
| `alert` | Flash messages (`FlashAlerts`) |
| `badge` | Status chips |
| `select` | Program/year dropdowns |
| `separator` | Layout |

Shared: `FlashAlerts`, `PaginationLinks`, `LibraryLayout` (grouped sidebar + breadcrumbs), `PageHeader`, `FilterSidebarCard`, `EmptyState`, `StatusBadge`.

---

## Inertia pages (library + public)

| Route | Page |
|-------|------|
| `/opac` | `Opac/Landing.tsx` |
| `/books` | `Books/Index.tsx` |
| `/logs` | `Library/Logs/Index.tsx` |
| `/students` | `Library/Students/Index.tsx` |
| `/students/create` | `Library/Students/Create.tsx` |
| `/students/{id}/edit` | `Library/Students/Edit.tsx` |
| `/student/pending-requests` | `Library/Students/PendingRequests.tsx` |
| `/employees` | `Library/Employees/Index.tsx` |
| `/employees/create` | `Library/Employees/Create.tsx` |
| `/employees/edit/{id}` | `Library/Employees/Edit.tsx` |
| `/pending` | `Library/Pending/Index.tsx` |
| `/admin/circulation-policy` | `Library/Policy/Edit.tsx` |
| `/admin/fines/outstanding` | `Library/Fines/Outstanding.tsx` |
| `/rooms/pending` | `Library/Rooms/Pending.tsx` |
| `/rooms/logs` | `Library/Rooms/Logs.tsx` |
| `/files` | `Library/Files/Index.tsx` |
| `/ebooks` | `Library/Ebooks/Index.tsx` |
| `/ebooks/create` | `Library/Ebooks/Create.tsx` |
| `/ebooks/{id}/edit` | `Library/Ebooks/Edit.tsx` |
| `/admin/catalog-frameworks` | `Library/Admin/CatalogFrameworks/Index.tsx` |
| `/admin/catalog-select-options` | `Library/Admin/CatalogSelectOptions/Index.tsx` |
| `/admin/activities` | `Library/Admin/Activities/Index.tsx` |
| `/reports/library-holdings` | `Library/Reports/Holdings.tsx` |
| `/staff/books/copies` | `Library/Books/CopiesStaff.tsx` |
| `/staff/books/archived` | `Library/Books/Archived.tsx` |
| `/staff/books/trash` | `Library/Books/Trash.tsx` |

Attendance module: 18+ Inertia pages (kiosk, logs, patrons, settings, SMS, reports).

---

## Library sidebar map (USM hierarchy)

- **Home:** admin or staff dashboard
- **Catalog:** books, ebooks, copies, archived, trash
- **Circulation:** logs, policy, fines
- **Patrons:** students, employees, pending, edit requests
- **Rooms:** pending, logs, manage rooms
- **Reports:** holdings, activity
- **Admin:** repository, MARC frameworks, dropdown options, prospectus, SMS blast

## Module ownership

- **Library admin:** full catalog, circulation, patron approvals, rooms, reports, policy/fines, catalog frameworks/options, repository
- **Library staff:** dashboard, catalog browsing/actions allowed by route policy, reports, activity, account access
- **Attendance roles:** isolated in attendance routes/layouts and separate domain tables

## Rollout verification (2026-06-26)

- `php artisan db:seed` ✅
- `php artisan test --filter=LibraryInertiaPagesTest` ✅ (23 passed, 177 assertions)
- `npm run build` ✅

---

## Seeded staff accounts

| Role | Email | Password |
|------|-------|----------|
| library_admin | library_admin@jmc.test | password |
| super_admin | super_admin@jmc.test | password |

---

## Quick commands

```bash
cd jmc
composer run dev
php artisan db:seed
php artisan test
npm run build
```
