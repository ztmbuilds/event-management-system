import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from "class-validator";

import { CreateEventInput } from "../graphql/typeDefs/event.types";

@ValidatorConstraint({ async: false })
export class StartDateValidator implements ValidatorConstraintInterface {
  validate(value: Date | string): boolean {
    const startDate = new Date(value);
    const currentTime = new Date();

    return startDate > currentTime;
  }
  defaultMessage(): string {
    return "startDate must not be before the current time";
  }
}

@ValidatorConstraint({ async: false })
export class EndDateValidator implements ValidatorConstraintInterface {
  validate(endDate: Date, args: ValidationArguments) {
    const { startDate } = args.object as CreateEventInput;
    const currentTime = new Date();

    return endDate > currentTime && endDate > startDate;
  }

  defaultMessage() {
    return "End date must be after start date and current time";
  }
}
