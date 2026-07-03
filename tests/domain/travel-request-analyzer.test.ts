import { describe, expect, it } from "vitest";

import { analyzeTravelRequest } from "../../src/domain/travel-request-analyzer";
import type { RequesterType, TravelRequestInput } from "../../src/main";

function makeInput(overrides: Partial<TravelRequestInput> = {}): TravelRequestInput {
  return {
    requestId: "TR-100",
    requesterName: "Grace Hopper",
    requesterType: "employee",
    destination: "Teresina",
    departureDate: "2026-08-10",
    returnDate: "2026-08-12",
    reason: "Attend institutional technical meeting",
    transportCostInCents: 12000,
    ...overrides,
  };
}

describe("analyzeTravelRequest", () => {
  it("approves a valid travel request", () => {
    expect(analyzeTravelRequest(makeInput())).toEqual({
      requestId: "TR-100",
      status: "approved",
      travelDays: 3,
      dailyAmountInCents: 18000,
      subtotalInCents: 54000,
      totalAmountInCents: 66000,
      errors: [],
      warnings: [],
    });
  });

  it("rejects missing required fields", () => {
    const output = analyzeTravelRequest(
      makeInput({
        requestId: "",
        requesterName: "",
        requesterType: "" as RequesterType,
        destination: "",
        departureDate: "",
        returnDate: "",
      }),
    );

    expect(output.status).toBe("rejected");
    expect(output.errors).toEqual([
      "requestId is required",
      "requesterName is required",
      "requesterType is required",
      "destination is required",
      "departureDate is required",
      "returnDate is required",
    ]);
  });

  it("rejects invalid dates", () => {
    const output = analyzeTravelRequest(
      makeInput({
        departureDate: "2026/08/10",
        returnDate: "2026-02-30",
      }),
    );

    expect(output.status).toBe("rejected");
    expect(output.errors).toEqual([
      "departureDate must be a valid YYYY-MM-DD date",
      "returnDate must be a valid YYYY-MM-DD date",
    ]);
  });

  it("rejects a return date before the departure date", () => {
    const output = analyzeTravelRequest(
      makeInput({
        departureDate: "2026-08-15",
        returnDate: "2026-08-14",
      }),
    );

    expect(output.status).toBe("rejected");
    expect(output.errors).toEqual(["returnDate cannot be before departureDate"]);
  });

  it("calculates travel days inclusively", () => {
    const output = analyzeTravelRequest(
      makeInput({
        departureDate: "2026-09-01",
        returnDate: "2026-09-01",
      }),
    );

    expect(output.travelDays).toBe(1);
    expect(output.subtotalInCents).toBe(18000);
  });

  it("uses the configured daily amount for each requester type", () => {
    const examples = [
      ["student", 9000],
      ["employee", 18000],
      ["professor", 25000],
      ["manager", 30000],
    ] satisfies Array<[RequesterType, number]>;

    for (const [requesterType, expectedDailyAmountInCents] of examples) {
      expect(
        analyzeTravelRequest(makeInput({ requesterType })).dailyAmountInCents,
      ).toBe(expectedDailyAmountInCents);
    }
  });

  it("marks requests longer than five days as pending review", () => {
    const output = analyzeTravelRequest(
      makeInput({
        departureDate: "2026-11-01",
        returnDate: "2026-11-06",
        reason: "Participate in a scheduled institutional workshop",
      }),
    );

    expect(output.status).toBe("pending-review");
    expect(output.travelDays).toBe(6);
  });

  it("marks requests above 200000 cents as pending review", () => {
    const output = analyzeTravelRequest(
      makeInput({
        requesterType: "manager",
        departureDate: "2026-12-01",
        returnDate: "2026-12-05",
        transportCostInCents: 60000,
      }),
    );

    expect(output.status).toBe("pending-review");
    expect(output.totalAmountInCents).toBe(210000);
  });

  it("adds a warning for long requests with a short reason", () => {
    const output = analyzeTravelRequest(
      makeInput({
        departureDate: "2027-01-10",
        returnDate: "2027-01-16",
        reason: "Meeting",
      }),
    );

    expect(output.warnings).toEqual([
      "long travel requests should include a detailed reason",
    ]);
  });
});
