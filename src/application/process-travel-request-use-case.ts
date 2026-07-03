import { analyzeTravelRequest } from "../domain/travel-request-analyzer.js";
import type { TravelRequestInput, TravelRequestOutput } from "../domain/travel-request.js";

export class ProcessTravelRequestUseCase {
  execute(input: TravelRequestInput): TravelRequestOutput {
    return analyzeTravelRequest(input);
  }
}
