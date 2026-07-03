# TEC2 Final Assessment

Refactoring of the institutional travel request processor for the final assessment of Topicos Especiais em Computacao II at UESPI.

## Team

- Gabriel Remigio de Sá

## Activity

The project preserves the public behavior provided by the base repository while moving the implementation out of `src/original/`. The public contract remains in `src/main.ts`, and the original professor tests continue to import only from that file.

## Requirements

- Node.js 22 or compatible
- npm
- Docker and Docker Compose for PostgreSQL persistence checks

## Installation

```bash
npm install
```

## Tests

```bash
npm test
npm run test:original
```

The infrastructure test is skipped when `DATABASE_URL` is not set, so regular unit tests do not require a running database.

## Typecheck

```bash
npm run typecheck
```

## Database

Copy `.env.example` to `.env` or export the same variable in your shell:

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5432/travel_requests
```

Then run:

```bash
npm run db:up
npm run db:init
npm test
npm run db:down
```

## Architecture

- `src/domain/`: pure travel request rules, validation, date calculation, amount calculation, status decision, errors and warnings.
- `src/application/`: the `ProcessTravelRequestUseCase`, which delegates to the domain without duplicating business rules.
- `src/infra/`: direct PostgreSQL persistence through `PostgresTravelRequestRepository`.
- `src/main.ts`: public entry point that exports `TravelRequestInput`, `TravelRequestOutput` and `processTravelRequest`.

## Persistence

Persistence uses the existing `pg` dependency and the `travel_requests` table created by `database/init.sql`. The repository provides two simple methods:

- `save(output)`: stores or replaces a travel request analysis.
- `findByRequestId(requestId)`: retrieves a stored analysis or returns `null`.

The repository reads `DATABASE_URL` when it creates its own PostgreSQL client. Tests can also pass a connected client directly.

## Technical decisions

- The legacy implementation and professor tests were preserved unchanged.
- No HTTP server, REST API, controllers, factories, dependency injection container, decorators or ORM were added.
- The domain is independent from PostgreSQL, environment variables, files and network access.
- SQL is isolated in `src/infra/postgres-travel-request-repository.ts`.
- The public synchronous API was kept in `src/main.ts`.

## Use of AI tools

AI tools used:
- ChatGPT
- Codex

How AI was used:
- To help interpret the assignment requirements.
- To suggest a minimal architecture.
- To support refactoring and test planning.
- To review documentation wording.

Accepted suggestions:
- Separation between domain, application and infrastructure.
- Keeping `src/main.ts` as the public contract.
- Adding unit tests for validation, calculations and status decision.
- Using simple SQL-based persistence.

Rejected or modified suggestions:
- Overly complex architecture.
- Unnecessary factories, controllers, services or dependency injection containers.
- Extra methods not required by the assignment.

Technical validation:
- The original behavior was checked with `tests/original/`.
- The refactored implementation was validated with `npm test`.
- Type safety was validated with `npm run typecheck`.
- Persistence was validated with the database scripts documented in this README.

## Technical validation

Run this sequence before delivery:

```bash
npm install
npm run typecheck
npm test
npm run test:original
```

For PostgreSQL validation:

```bash
npm run db:up
npm run db:init
npm test
npm run db:down
```

## Known limitations

- The public `processTravelRequest` function remains synchronous, so persistence is tested directly through the infrastructure repository instead of being part of the public API.
- The repository stores the analysis fields required by the assignment. The existing database table also contains request-detail columns, which are filled with empty strings when only a `TravelRequestOutput` is saved.
