import {
  dailyAmountInCentsByRequesterType,
  type TravelRequestInput,
  type TravelRequestOutput,
  type TravelRequestStatus,
} from "./travel-request.js";

const millisecondsPerDay = 86_400_000;

function isInvalidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return true;
  }

  const [yearText, monthText, dayText] = value.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  );
}

function getDayNumber(value: string): number {
  const [yearText, monthText, dayText] = value.split("-");

  return Date.UTC(Number(yearText), Number(monthText) - 1, Number(dayText));
}

function getDailyAmountInCents(
  requesterType: TravelRequestInput["requesterType"],
): number {
  return dailyAmountInCentsByRequesterType[requesterType] ?? 0;
}

function getStatus(errors: string[], travelDays: number, totalInCents: number): TravelRequestStatus {
  if (errors.length > 0) {
    return "rejected";
  }

  if (travelDays > 5 || totalInCents > 200000) {
    return "pending-review";
  }

  return "approved";
}

export function analyzeTravelRequest(input: TravelRequestInput): TravelRequestOutput {
  const errors: string[] = [];
  const warnings: string[] = [];
  let travelDays = 0;

  if (!input.requestId) {
    errors.push("requestId is required");
  }
  if (!input.requesterName) {
    errors.push("requesterName is required");
  }
  if (!input.requesterType) {
    errors.push("requesterType is required");
  }
  if (!input.destination) {
    errors.push("destination is required");
  }
  if (!input.departureDate) {
    errors.push("departureDate is required");
  }
  if (!input.returnDate) {
    errors.push("returnDate is required");
  }

  let hasInvalidDepartureDate = false;
  let hasInvalidReturnDate = false;

  if (input.departureDate) {
    if (isInvalidDate(input.departureDate)) {
      errors.push("departureDate must be a valid YYYY-MM-DD date");
      hasInvalidDepartureDate = true;
    }
  } else {
    hasInvalidDepartureDate = true;
  }

  if (input.returnDate) {
    if (isInvalidDate(input.returnDate)) {
      errors.push("returnDate must be a valid YYYY-MM-DD date");
      hasInvalidReturnDate = true;
    }
  } else {
    hasInvalidReturnDate = true;
  }

  if (!hasInvalidDepartureDate && !hasInvalidReturnDate) {
    const departureDayNumber = getDayNumber(input.departureDate);
    const returnDayNumber = getDayNumber(input.returnDate);

    if (returnDayNumber < departureDayNumber) {
      errors.push("returnDate cannot be before departureDate");
    } else {
      travelDays = Math.floor((returnDayNumber - departureDayNumber) / millisecondsPerDay) + 1;
    }
  }

  const dailyAmountInCents = getDailyAmountInCents(input.requesterType);
  const subtotalInCents = travelDays * dailyAmountInCents;
  const totalAmountInCents = subtotalInCents + input.transportCostInCents;

  if (travelDays > 5 && input.reason.length < 30) {
    warnings.push("long travel requests should include a detailed reason");
  }

  return {
    requestId: input.requestId,
    status: getStatus(errors, travelDays, totalAmountInCents),
    travelDays,
    dailyAmountInCents,
    subtotalInCents,
    totalAmountInCents,
    errors,
    warnings,
  };
}
