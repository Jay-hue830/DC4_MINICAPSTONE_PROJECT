# Senior Citizen Request and Assistance Tracking System

A full-stack web application for administering senior citizen profiles and tracking assistance requests from submission through review and completion.

## Technology stack

- Backend: PHP 8.3, Laravel 13, Laravel Sanctum, Eloquent
- Frontend: React 19, Vite, React Router, Axios
- Database: SQLite by default; MySQL is supported through Laravel database configuration

## Setup

Run backend commands from the repository root.

### Backend

```sh
composer install
```

Copy `.env.example` to `.env`, then configure the database settings. The example uses SQLite; create `database/database.sqlite` if it does not exist. For MySQL, set `DB_CONNECTION=mysql` and configure `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD`.

```sh
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

The API is available at `http://localhost:8000/api`.

### Frontend

In a second terminal:

```sh
cd frontend_seniorcitizen_react
npm install
```

Copy `frontend_seniorcitizen_react/.env.example` to `.env` if needed. Set `VITE_API_URL=http://localhost:8000/api`, then run:

```sh
npm run dev
```

The frontend is available at `http://localhost:5173`. For a production build, run `npm run build` from the frontend directory.

### Seeded demo accounts

These credentials are for local development databases created with `php artisan migrate --seed`. Do not reuse them in a deployed environment.

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@seniorcare.test` | `Admin#Care2026` |
| Senior citizen | `lolita.santos@seniorcare.test` | `Senior#2026` |

## Features

- Token-based registration, login, and logout using Laravel Sanctum.
- Role-based admin and senior-citizen access.
- Admin dashboard statistics and recent request data.
- Admin senior-citizen management with search, pagination, detail, and edit.
- Senior self-registration creates a linked senior profile; registration always assigns the senior role.
- Senior citizens can submit, view, and edit their own pending assistance requests.
- Admins can view and delete assistance requests and manage valid status transitions.
- Senior profiles with assistance-request history cannot be deleted.
- Responsive layouts for lists and dashboards.

## API overview

All protected endpoints require `Authorization: Bearer <token>` and `Accept: application/json`.

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/register` | Public | Register a senior and create their profile |
| `POST` | `/api/login` | Public | Obtain a bearer token |
| `GET` | `/api/user` | Authenticated | Get the current user |
| `POST` | `/api/logout` | Authenticated | Revoke the current token |
| `GET` | `/api/dashboard` | Authenticated | Get role-scoped dashboard statistics |
| `GET` | `/api/assistance-types` | Authenticated | List assistance types |
| `GET`, `POST` | `/api/assistance-requests` | Authenticated | List (paginated) or create requests |
| `GET` | `/api/assistance-requests/{id}` | Admin or owning senior | View a request |
| `PUT`, `PATCH` | `/api/assistance-requests/{id}` | Admin (pending/approved) or owning senior (pending) | Update a request |
| `DELETE` | `/api/assistance-requests/{id}` | Admin | Delete a request |
| `PATCH` | `/api/assistance-requests/{id}/status` | Admin | Transition a request to an allowed status |
| `GET`, `POST` | `/api/senior-citizens` | Admin | List (paginated) or create senior profiles |
| `GET`, `PUT`, `PATCH`, `DELETE` | `/api/senior-citizens/{id}` | Admin | View, update, or delete a senior profile |

Request status transitions are defined by the backend. Rejection requires an admin remark. Deleting a senior profile with request history returns `409 Conflict`.

The [Postman collection](./docs/Senior-Citizen-Assistance-API.postman_collection.json) and [entity relationship diagram](./docs/erd.md) are in `docs/`.

## Tests and checks

```sh
php artisan test --compact
vendor/bin/pint --dirty --format agent
cd frontend_seniorcitizen_react
npm run lint
npm run build
```

`php artisan migrate:fresh --seed` drops all existing tables before rebuilding them. Only use it against a disposable development database.

## AI usage

GitHub Copilot and Claude were used to assist with code generation and debugging. The project author reviewed and tested the resulting changes.
