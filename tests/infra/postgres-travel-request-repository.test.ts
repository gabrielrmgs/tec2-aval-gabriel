import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { PostgresTravelRequestRepository } from "../../src/infra/postgres-travel-request-repository";
import type { TravelRequestOutput } from "../../src/main";

const databaseUrl = process.env.DATABASE_URL;

describe.skipIf(!databaseUrl)("PostgresTravelRequestRepository", () => {
  let client: pg.Client;
  let repository: PostgresTravelRequestRepository;

  beforeAll(async () => {
    client = new pg.Client({ connectionString: databaseUrl });
    await client.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS travel_requests (
        id TEXT PRIMARY KEY,
        requester_name TEXT NOT NULL,
        requester_type TEXT NOT NULL,
        destination TEXT NOT NULL,
        departure_date TEXT NOT NULL,
        return_date TEXT NOT NULL,
        reason TEXT NOT NULL,
        status TEXT NOT NULL,
        travel_days INTEGER NOT NULL,
        daily_amount_in_cents INTEGER NOT NULL,
        subtotal_in_cents INTEGER NOT NULL,
        transport_cost_in_cents INTEGER NOT NULL,
        total_amount_in_cents INTEGER NOT NULL,
        created_at TEXT NOT NULL
      )
    `);
    repository = new PostgresTravelRequestRepository(client);
  });

  afterAll(async () => {
    await client.end();
  });

  it("saves and retrieves a travel request analysis", async () => {
    const output: TravelRequestOutput = {
      requestId: "TR-INFRA-001",
      status: "approved",
      travelDays: 2,
      dailyAmountInCents: 18000,
      subtotalInCents: 36000,
      totalAmountInCents: 46000,
      errors: [],
      warnings: [],
    };

    await client.query("DELETE FROM travel_requests WHERE id = $1", [
      output.requestId,
    ]);
    await repository.save(output);

    await expect(repository.findByRequestId(output.requestId)).resolves.toEqual(
      output,
    );
  });
});
