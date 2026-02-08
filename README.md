# OpsMind Ticket Service

A microservice for managing IT support tickets with event-driven architecture.

## Features

- ✅ CRUD operations for tickets
- ✅ Request validation with Zod
- ✅ Event publishing to RabbitMQ
- ✅ MySQL database with Prisma ORM
- ✅ Graceful shutdown handling
- ✅ Structured JSON logging
- ✅ Health checks (basic + deep)
- ✅ CORS support (see below)
- ✅ Docker + Docker Compose ready

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js 5
- **Language**: TypeScript
- **Database**: MySQL 8 + Prisma ORM
- **Message Broker**: RabbitMQ
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose (for local dependencies)

### 1. Install dependencies

```bash
npm install
```

### 2. Setup environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start dependencies (MySQL + RabbitMQ)

```bash
docker-compose up -d db rabbitmq
```

### 4. Run database migrations

```bash
npm run db:generate
npm run db:migrate
```

### 5. Start development server

```bash
npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Basic health check |
| GET | `/health/ready` | Deep health check (DB + RabbitMQ) |
| GET | `/tickets` | List tickets (with filtering) |
| GET | `/tickets/:id` | Get ticket by ID |
| POST | `/tickets` | Create a new ticket |
| PATCH | `/tickets/:id` | Update a ticket |
| DELETE | `/tickets/:id` | Delete a ticket |

### Query Parameters for GET /tickets

- `status` - Filter by status (OPEN, ASSIGNED, IN_PROGRESS, RESOLVED, CLOSED)
- `priority` - Filter by priority (LOW, MEDIUM, HIGH, CRITICAL)
- `assignedToUserId` - Filter by assigned user
- `limit` - Number of results (default: 50)
- `offset` - Pagination offset (default: 0)

### Create Ticket Request Body

```json
{
  "title": "Printer not working",
  "description": "Office printer shows error E-01",
  "type": "INCIDENT",
  "priority": "HIGH",
  "createdByUserId": "user-123"
}
```

## Events Published

| Event | Routing Key | When |
|-------|-------------|------|
| Ticket Created | `ticket.created` | After POST /tickets |
| Ticket Updated | `ticket.updated` | After PATCH /tickets/:id |

Events are published to exchange: `ticket.events` (topic exchange).

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled production server |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run migrations (dev) |
| `npm run db:migrate:prod` | Run migrations (prod) |
| `npm run db:studio` | Open Prisma Studio |
| `npm run typecheck` | Type check without emitting |

## Docker

### Build and run with Docker Compose

```bash
docker-compose up --build
```

- The service is exposed on port **3001** (host) mapped to **3000** (container).
- CORS is enabled for: `http://localhost:5173`, `http://localhost:3001`, and `http://localhost:8085` (see `CORS_ORIGINS` in `docker-compose.yml`).

### Build image only

```bash
docker build -t opsmind-ticket-service .
```

## Project Structure

```
src/
├── server.ts              # Entry point
├── app.ts                 # Express app setup
├── config/
│   ├── index.ts           # Environment config
│   └── logger.ts          # Structured logger
├── routes/
│   └── ticket.routes.ts   # Ticket endpoints
├── validation/
│   └── ticket.schema.ts   # Zod schemas
├── middleware/
│   ├── error.middleware.ts
│   ├── validate.middleware.ts
│   └── requestId.middleware.ts
├── errors/
│   └── AppError.ts        # Custom error class
├── lib/
│   ├── prisma.ts          # Prisma client
│   └── rabbitmq.ts        # RabbitMQ connection
├── events/
│   └── publishers/
│       └── ticket.publisher.ts
└── utils/
    └── gracefulShutdown.ts
```

## GitHub User Configuration (Local Commits)

To ensure all commits and pushes from this project are associated with your GitHub user:

```bash
git config user.name "Janah-mahmoudd"
git config user.email "janahmahmoud94@gmail.com"
```

This sets your Git identity for this repository only.

## License

ISC
