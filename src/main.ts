import { ProcessTravelRequestUseCase } from "./application/process-travel-request-use-case.js";
import type { TravelRequestInput, TravelRequestOutput } from "./domain/travel-request.js";

export type {
  RequesterType,
  TravelRequestInput,
  TravelRequestOutput,
  TravelRequestStatus,
} from "./domain/travel-request.js";

const processTravelRequestUseCase = new ProcessTravelRequestUseCase();

export function processTravelRequest(input: TravelRequestInput): TravelRequestOutput {
  return processTravelRequestUseCase.execute(input);
}
