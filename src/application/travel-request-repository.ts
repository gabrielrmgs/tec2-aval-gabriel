import type { TravelRequestOutput } from "../domain/travel-request.js";

export interface TravelRequestRepository {
  save(output: TravelRequestOutput): Promise<void>;
  findByRequestId(requestId: string): Promise<TravelRequestOutput | null>;
}
