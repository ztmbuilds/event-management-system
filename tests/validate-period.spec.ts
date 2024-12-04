import { periodIsWithinPeriod } from "../src/utils/validate-period";

describe("Validate Period", () => {
  let outerPeriod = {
    startDate: "",
    endDate: "",
  };
  let innerPeriod = {
    date: "",
    startTime: "",
    endTime: "",
  };
  it("should return true if all are valid", () => {
    outerPeriod.startDate = "2024-11-28T08:00:00.000+01:00";
    outerPeriod.endDate = "2024-12-03T17:00:00.000+01:00";

    innerPeriod.date = "2024-11-30T05:00:00.000+01:00";
    innerPeriod.startTime = "2024-11-30T08:00:00.000+01:00";
    innerPeriod.endTime = "2024-11-30T17:00:00.000+01:00";

    const isValid = periodIsWithinPeriod(outerPeriod, innerPeriod);

    expect(isValid).toBe(true);
  });

  it("should return false if  date is before startDate", () => {
    outerPeriod.startDate = "2024-11-28T08:00:00.000+01:00";
    outerPeriod.endDate = "2024-12-03T17:00:00.000+01:00";

    innerPeriod.date = "2024-11-25T05:00:00.000+01:00";
    innerPeriod.startTime = "2024-11-30T08:00:00.000+01:00";
    innerPeriod.endTime = "2024-11-30T17:00:00.000+01:00";

    const isValid = periodIsWithinPeriod(outerPeriod, innerPeriod);

    expect(isValid).toBe(false);
  });

  it("should return false if  an invalid value is passed", () => {
    outerPeriod.startDate = "2024-11-28T08:00:00.000+01:00";
    outerPeriod.endDate = "1";

    innerPeriod.date = "invalid valuee";
    innerPeriod.startTime = "2024-11-30T08:00:00.000+01:00";
    innerPeriod.endTime = "2024-11-30T17:00:00.000+01:00";

    const isValid = periodIsWithinPeriod(outerPeriod, innerPeriod);

    expect(isValid).toBe(false);
  });
});
