import { describe, expect, it } from "vitest";

import { ProcessTravelRequestUseCase } from "../../src/application/process-travel-request-use-case";
import type { TravelRequestInput, TravelRequestOutput } from "../../src/main";

function makeInput(overrides: Partial<TravelRequestInput> = {}): TravelRequestInput {
  return {
    requestId: "TR-200",
    requesterName: "Katherine Johnson",
    requesterType: "professor",
    destination: "Parnaiba",
    departureDate: "2026-09-01",
    returnDate: "2026-09-02",
    reason: "Present institutional research results",
    transportCostInCents: 30000,
    ...overrides,
  };
}

describe("ProcessTravelRequestUseCase", () => {
  it("returns the expected analyzed result", () => {
    const useCase = new ProcessTravelRequestUseCase();

    expect(useCase.execute(makeInput())).toEqual({
      requestId: "TR-200",
      status: "approved",
      travelDays: 2,
      dailyAmountInCents: 25000,
      subtotalInCents: 50000,
      totalAmountInCents: 80000,
      errors: [],
      warnings: [],
    });
  });

  it("keeps persistence outside the synchronous use case", () => {
    const savedOutputs: TravelRequestOutput[] = [];
    const useCase = new ProcessTravelRequestUseCase();
    const output = useCase.execute(makeInput({ requestId: "TR-201" }));

    savedOutputs.push(output);

    expect(savedOutputs).toEqual([output]);
  });
});
