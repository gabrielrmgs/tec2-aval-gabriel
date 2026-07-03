# TEC2 Final Assessment Notes

## Summary

This solution refactors the legacy institutional travel request processor while preserving the public behavior expected by the professor tests. The public entry point remains `src/main.ts`, and the legacy files under `src/original/` are kept untouched.

## Behavior preservation strategy

The original tests in `tests/original/` were used as the public behavior contract. The refactored code keeps the same input and output types, the same status values, the same inclusive date calculation and the same public validation messages.

## Refactoring decisions

The solution uses a small three-layer split:

- Domain code contains pure rules and calculations.
- Application code exposes the main use case and delegates to the domain.
- Infrastructure code contains PostgreSQL access through direct SQL.

No HTTP server, controller layer, ORM, factory, decorator or dependency injection container was added because the assignment only needs a simple synchronous public function and a small persistence adapter.

## Domain

`src/domain/travel-request.ts` defines the public travel request types and daily amount table. `src/domain/travel-request-analyzer.ts` validates required fields and dates, calculates inclusive travel days, calculates amounts, decides the final status and emits public errors and warnings.

The domain does not depend on PostgreSQL, environment variables, files or network access.

## Application

`src/application/process-travel-request-use-case.ts` contains `ProcessTravelRequestUseCase`. It keeps the application flow small and delegates business decisions to `analyzeTravelRequest`.

`src/application/travel-request-repository.ts` defines the simple repository interface used by infrastructure.

## Infrastructure

`src/infra/postgres-travel-request-repository.ts` uses the existing `pg` dependency and SQL directly. It saves and retrieves travel request analyses using the `travel_requests` table initialized by `database/init.sql`.

The repository can create its own client from `DATABASE_URL` or receive a client in tests.

## Tests

The test suite includes:

- Original professor tests in `tests/original/`.
- Domain tests for validation, date handling, inclusive days, daily amounts, status decisions and warnings.
- Application tests for the main use case.
- Infrastructure test for PostgreSQL save and retrieve, skipped when `DATABASE_URL` is not available.

## Use of AI

AI tools were used to support requirement interpretation, refactoring planning, test coverage selection and documentation wording. Suggestions that would add unnecessary architecture were rejected to keep the solution aligned with the assignment size.
