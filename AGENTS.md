# AGENTS.md — jmc

Laravel 12 application for a combined school attendance and library management system.

Run all commands from this directory (`jmc/`).

## Stack

- PHP 8.2+, Laravel 12
- Inertia.js + React + TypeScript (frontend application layer)
- Tailwind CSS + shadcn/ui (primary UI system for React pages)
- PostgreSQL (recommended primary database for reporting and constraints)
- Laravel Sanctum + `spatie/laravel-permission` for auth and roles

## Cursor Skills And Rules

- Follow workspace rules from `@AGENTS.md`, `.agents/AGENTS.md`, and `.cursor/rules/pantas-core.mdc`.
- For UI work in React pages, use the `shadcn-ui` skill (`.agents/skills/shadcn-ui/`).
- Do not use daisyUI for this repo.
- Keep each task scoped to this repo when using sub-agents.

## Key Paths

- `app/Http/Controllers/` — request handling
- `app/Models/` — Eloquent models
- `app/Policies/` — authorization policies
- `database/migrations/` — schema changes
- `resources/js/` — Inertia React pages/components
- `resources/css/` — Tailwind styles
- `routes/web.php` — web routes
- `routes/api.php` — API routes (if introduced)
- `tests/` — PHPUnit/Pest tests

## Local Setup

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate
```

## Common Commands

```bash
php artisan serve
npm run dev
composer run dev
npm run build
php artisan test
./vendor/bin/pint
php artisan route:list
```

## Domain Priorities

- Attendance check-in/check-out, status rules, and correction logs
- Library catalog, copies, checkout/return/renewal, and fines
- Shared student/staff identity and role-based access
- Reports and audit history for sensitive operations

## Coding Standards

- Prefer Form Requests, policies, named routes, and explicit validation.
- Keep controllers thin and move business logic to services/actions when it grows.
- Use database transactions for attendance writes, circulation, and fine operations.
- Keep frontend UI components reusable and consistent with shadcn patterns.

## Verification

```bash
php -l path/to/file.php
php artisan test --filter=RelevantTest
./vendor/bin/pint
npm run build
```
