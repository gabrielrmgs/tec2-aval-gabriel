export type RequesterType = "student" | "employee" | "professor" | "manager";

export type TravelRequestStatus = "approved" | "pending-review" | "rejected";

export type TravelRequestInput = {
  requestId: string;
  requesterName: string;
  requesterType: RequesterType;
  destination: string;
  departureDate: string;
  returnDate: string;
  reason: string;
  transportCostInCents: number;
};

export type TravelRequestOutput = {
  requestId: string;
  status: TravelRequestStatus;
  travelDays: number;
  dailyAmountInCents: number;
  subtotalInCents: number;
  totalAmountInCents: number;
  errors: string[];
  warnings: string[];
};

export const dailyAmountInCentsByRequesterType: Record<RequesterType, number> = {
  student: 9000,
  employee: 18000,
  professor: 25000,
  manager: 30000,
};
