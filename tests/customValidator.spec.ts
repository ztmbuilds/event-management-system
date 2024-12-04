import { ValidationArguments } from "class-validator";
import { StartDateValidator } from "../src/utils/customValidator";
import { EndDateValidator } from "../src/utils/customValidator";

describe("startDate validator", () => {
  let startDate = "";
  let startDateValidator = new StartDateValidator();

  it("should return false if startDate is before current Time", () => {
    startDate = "2024-12-04T09:06:00.000+01:00";

    expect(startDateValidator.validate(startDate)).toBe(false);
  });
});

describe("endDate validator", () => {
  let endDateValidator = new EndDateValidator();
  let endDate = "";
  let args = {
    object: {
      startDate: "2024-12-05T08:00:00.000+01:00",
    },
  } as ValidationArguments;

  it("should return false if endDate is before startDate", () => {
    endDate = "2024-12-05T06:59:59.000Z";

    expect(endDateValidator.validate(endDate, args)).toBe(false);
  });
});
