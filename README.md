# Senior Citizen Request and Assistance Tracking System

A full-stack web application for administering senior citizen profiles and tracking assistance requests from submission through review and completion.

## Project description

The system is designed for a Barangay or OSCA office to receive, review, and track senior citizens' requests for assistance. It replaces scattered paper or chat-based tracking with a shared request status and a dashboard of current records.

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

Copy `.env.example` to `.env`, then configure the database settings. The example uses SQLite; create `database/database.sqlite` if it does not exist. For MySQL, set `DB_CONNECTION=mysql`, `DB_DATABASE=senior_assistance_db`, and configure `DB_HOST`, `DB_PORT`, `DB_USERNAME`, and `DB_PASSWORD`.

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
- Senior self-registration creates a linked senior profile; registration always assigns the `senior_citizen` role.
- Senior citizens can submit, view, and edit their own pending assistance requests.
- Seniors can delete their own pending requests; admins can delete requests and manage valid status transitions.
- Senior profiles with assistance-request history cannot be deleted.
- Responsive layouts for lists and dashboards.

## User roles and workflow

| Role | Capabilities |
| --- | --- |
| Admin | Manage senior citizen profiles, review requests, change request status, and view system-wide dashboard counts |
| Senior Citizen | Manage their own requests and view their own dashboard counts and request statuses |

The normal request workflow is `pending` → `approved` → `in_progress` → `completed`; a pending request can also be `rejected`. Invalid transitions are rejected by the API.

## Architecture

The React single-page application calls the Laravel REST API with Axios and Sanctum bearer-token authentication. Laravel uses Eloquent with SQLite by default or MySQL when configured.

## API overview

All protected endpoints require a bearer token in the `Authorization` header and an `Accept: application/json` header.

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
| `DELETE` | `/api/assistance-requests/{id}` | Admin or owning senior (pending only) | Delete a request |
| `PATCH` | `/api/assistance-requests/{id}/status` | Admin | Transition a request to an allowed status |
| `GET`, `POST` | `/api/senior-citizens` | Admin | List (paginated) or create senior profiles |
| `GET`, `PUT`, `PATCH`, `DELETE` | `/api/senior-citizens/{id}` | Admin | View, update, or delete a senior profile |

Request status transitions are defined by the backend. Rejection requires an admin remark. Deleting a senior profile with request history returns `409 Conflict`.

The application uses the `admin` and `senior_citizen` roles. The MySQL database name used in the setup instructions is `senior_assistance_db`; SQLite remains the default for local development.

The assistance-request list supports `search`, `assistance_type_id`, `status`, `date_from`, `date_to`, `page`, and `per_page` query parameters. `per_page` is capped at 50.

The [Postman collection (Collection v2.1)](./docs/Senior-Citizen-Assistance-API.postman_collection.json) and [entity relationship diagram source](./docs/erd.md) are in `docs/`.

## Demo video outline (about 7 minutes)

| Time | Demonstration |
| --- | --- |
| 0:00–0:30 | Introduce the project and the request-tracking problem |
| 0:30–1:30 | Log in as a senior and submit an assistance request |
| 1:30–3:00 | Log in as an admin; show dashboard counts and search/filter requests |
| 3:00–4:30 | Approve the request, then move it to completed |
| 4:30–5:30 | Log in as the senior and confirm the updated status |
| 5:30–6:30 | Show a validation error, delete confirmation, and mobile layout |
| 6:30–7:00 | Show the README and repository; close |

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
