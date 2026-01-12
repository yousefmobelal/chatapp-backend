# ChatApp Backend (Microservices Monorepo)

A Docker-first **Node.js + TypeScript** microservices backend for a chat application.

This repo is a **pnpm workspace monorepo** with multiple independently deployable services plus a shared `@chatapp/common` package.

---

## Architecture at a glance

**Services**

| Service           | Responsibility                                                         | Default port |
| ----------------- | ---------------------------------------------------------------------- | -----------: |
| `gateway-service` | Public API gateway (auth + routing to internal services)               |       `4000` |
| `auth-service`    | Authentication (register/login/refresh/revoke) + publishes auth events |       `4003` |
| `user-service`    | User profiles + consumes auth events + publishes user events           |       `4001` |
| `chat-service`    | Conversations/messages + caching + consumes user events                |       `4002` |

**Infrastructure (local dev via Docker Compose)**

- **RabbitMQ** (events): `5672` (AMQP), `15672` (management UI)
- **MongoDB** (chat data): `27017`
- **Redis** (chat caching): `6379`
- **PostgreSQL** (user-service): `5432`
- **MySQL** (auth-service): `3306`

---

## Quickstart (recommended): run everything with Docker Compose

### 1) Prerequisites

- Docker Desktop (with Compose)

### 2) Create a `.env`

Docker Compose provides safe defaults for most infra credentials/ports.
You _must_ provide secrets used by the services:

```bash
# required
JWT_SECRET=change-me-to-a-long-random-string-at-least-32-chars
JWT_REFRESH_SECRET=change-me-to-a-long-random-string-at-least-32-chars
INTERNAL_API_TOKEN=change-me-to-a-long-random-string-at-least-32-chars

# optional
NODE_ENV=development
```

> Notes
>
> - `JWT_SECRET` is used by the gateway to verify access tokens.
> - `JWT_REFRESH_SECRET` is used by the auth-service for refresh tokens.
> - `INTERNAL_API_TOKEN` is used for service-to-service calls (see “Internal auth”).

### 3) Start the stack

```bash
docker compose up --build
```

### 4) Verify health

- Gateway: `http://localhost:4000/health`
- Auth service: `http://localhost:4003/health`
- User service: `http://localhost:4001/health`
- Chat service: `http://localhost:4002/health`

RabbitMQ UI:

- `http://localhost:15672` (defaults: `guest` / `guest`)

---

## API usage

### Base URL

All public HTTP requests go through the gateway:

- `http://localhost:4000`

### Requests collection

There is a small request collection in `request.http` that you can run from VS Code using the **REST Client** extension.

### Auth endpoints (via gateway)

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/revoke`

Example (register):

```bash
curl -X POST http://localhost:4000/auth/register \
  -H "content-type: application/json" \
  -d '{"email":"test@example.com","password":"Test_test123456","displayName":"Test User"}'
```

### Protected endpoints

Most business endpoints require an access token:

- Send `Authorization: Bearer <accessToken>`

Conversation endpoints (via gateway):

- `POST /conversations`
- `GET /conversations`
- `GET /conversations/:id`
- `POST /conversations/:id/messages`
- `GET /conversations/:id/messages`

User endpoints (via gateway):

- `GET /users` (protected)
- `GET /users/:id` (protected)
- `GET /users/search`
- `POST /users`

---

## Internal auth (service-to-service)

Internal services (`auth-service`, `user-service`, `chat-service`) are protected by an internal token middleware.

- Header: `x-internal-token`
- Value: must match `INTERNAL_API_TOKEN`
- Exempt path: `/health`

In normal usage, **only the gateway** should call internal services directly.

---

## Event-driven messaging

RabbitMQ is used to sync data between services.

### Exchanges and routing keys

| Exchange      | Routing key            | Produced by    | Consumed by    | Purpose                                                  |
| ------------- | ---------------------- | -------------- | -------------- | -------------------------------------------------------- |
| `auth.events` | `auth.user.registered` | `auth-service` | `user-service` | Create/sync user in the user database after registration |
| `user.events` | `user.created`         | `user-service` | `chat-service` | Keep chat-service user store in sync                     |

---

## Local development without Docker (advanced)

The fastest loop is usually:

1. Run infra only via Docker
2. Run services via `pnpm dev`

### 1) Start infra dependencies

```bash
docker compose up -d rabbitmq mongo redis user-db auth-db
```

### 2) Install deps

```bash
pnpm install
```

### 3) Run services (watch mode)

```bash
pnpm dev
```

> `pnpm dev` runs each workspace package’s `dev` script.

---

## Workspace scripts

From the repo root:

- `pnpm build` — builds all packages
- `pnpm dev` — runs all packages in watch mode
- `pnpm lint` — lints all packages
- `pnpm format` — checks formatting (Prettier)
- `pnpm test` — currently prints “No tests yet” per service

---

## Repo layout

```text
packages/
  common/               # shared types, env validation, middleware, helpers
services/
  gateway-service/      # public entrypoint / API gateway
  auth-service/         # auth + JWT issuing + auth events
  user-service/         # users + consumes auth events + emits user events
  chat-service/         # conversations/messages + cache + consumes user events
```

---

## Troubleshooting

- **Gateway returns 401**: ensure you pass `Authorization: Bearer <token>` for protected routes.
- **Services fail to start**: make sure `.env` includes `JWT_SECRET`, `JWT_REFRESH_SECRET`, and `INTERNAL_API_TOKEN`.
- **RabbitMQ consumers/publishers not running**: confirm RabbitMQ is up and `RABBITMQ_URL` is configured (Docker Compose sets a default for containers).
- **Health checks failing in Compose**: wait for DB containers to become healthy (MySQL/Postgres can take a minute on first boot).

---

## Contributing

PRs are welcome.

Suggested workflow:

1. Create a feature branch
2. Run `pnpm lint` and `pnpm format`
3. Keep changes scoped to a single service whenever possible

---

## License

ISC (see package manifests).
