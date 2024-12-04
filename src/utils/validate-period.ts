type DateString = string | Date;

export function periodIsWithinPeriod(
  outerPeriod: {
    startDate: DateString;
    endDate: DateString;
  },
  innerPeriod: {
    date: DateString;
    startTime: DateString;
    endTime: DateString;
  }
) {
  const startDate = new Date(outerPeriod.startDate);
  const endDate = new Date(outerPeriod.endDate);

  const startTime = new Date(innerPeriod.startTime);
  const endTime = new Date(innerPeriod.endTime);
  const date = new Date(innerPeriod.date);

  return (
    startTime >= startDate &&
    startTime <= endDate &&
    endTime >= startDate &&
    endTime <= endDate &&
    startTime < endTime &&
    date >= startDate &&
    date <= endDate
  );
}
