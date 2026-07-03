import pg from "pg";

import type { TravelRequestRepository } from "../application/travel-request-repository.js";
import type { TravelRequestOutput } from "../domain/travel-request.js";

type TravelRequestRow = {
  id: string;
  status: TravelRequestOutput["status"];
  travel_days: number;
  daily_amount_in_cents: number;
  subtotal_in_cents: number;
  total_amount_in_cents: number;
};

export class PostgresTravelRequestRepository implements TravelRequestRepository {
  private readonly client: pg.Client;
  private readonly ownsClient: boolean;

  constructor(client?: pg.Client) {
    this.client =
      client ??
      new pg.Client({
        connectionString: process.env.DATABASE_URL,
      });
    this.ownsClient = !client;
  }

  async connect(): Promise<void> {
    if (this.ownsClient) {
      await this.client.connect();
    }
  }

  async close(): Promise<void> {
    if (this.ownsClient) {
      await this.client.end();
    }
  }

  async save(output: TravelRequestOutput): Promise<void> {
    await this.client.query(
      `
        INSERT INTO travel_requests (
          id,
          requester_name,
          requester_type,
          destination,
          departure_date,
          return_date,
          reason,
          status,
          travel_days,
          daily_amount_in_cents,
          subtotal_in_cents,
          transport_cost_in_cents,
          total_amount_in_cents,
          created_at
        )
        VALUES ($1, '', '', '', '', '', '', $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          travel_days = EXCLUDED.travel_days,
          daily_amount_in_cents = EXCLUDED.daily_amount_in_cents,
          subtotal_in_cents = EXCLUDED.subtotal_in_cents,
          transport_cost_in_cents = EXCLUDED.transport_cost_in_cents,
          total_amount_in_cents = EXCLUDED.total_amount_in_cents
      `,
      [
        output.requestId,
        output.status,
        output.travelDays,
        output.dailyAmountInCents,
        output.subtotalInCents,
        output.totalAmountInCents - output.subtotalInCents,
        output.totalAmountInCents,
        new Date().toISOString(),
      ],
    );
  }

  async findByRequestId(requestId: string): Promise<TravelRequestOutput | null> {
    const result = await this.client.query<TravelRequestRow>(
      `
        SELECT
          id,
          status,
          travel_days,
          daily_amount_in_cents,
          subtotal_in_cents,
          total_amount_in_cents
        FROM travel_requests
        WHERE id = $1
      `,
      [requestId],
    );

    const row = result.rows[0];

    if (!row) {
      return null;
    }

    return {
      requestId: row.id,
      status: row.status,
      travelDays: row.travel_days,
      dailyAmountInCents: row.daily_amount_in_cents,
      subtotalInCents: row.subtotal_in_cents,
      totalAmountInCents: row.total_amount_in_cents,
      errors: [],
      warnings: [],
    };
  }
}
