import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from "class-validator";

import { CreateEventInput } from "../graphql/typeDefs/event.types";
import { CreateTicketTypeInput } from "../graphql/typeDefs/ticket-type.types";

@ValidatorConstraint({ async: false })
export class StartDateValidator implements ValidatorConstraintInterface {
  validate(value: string): boolean {
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
  validate(endDate: Date | string, args: ValidationArguments) {
    let { startDate } = args.object as CreateEventInput;
    startDate = new Date(startDate);
    const currentTime = new Date();
    endDate = new Date(endDate);

    return endDate > currentTime && endDate > startDate;
  }

  defaultMessage() {
    return "End date must be after start date and current time";
  }
}

@ValidatorConstraint({ async: false })
export class AvailableQuantityValidator
  implements ValidatorConstraintInterface
{
  validate(availableQuantity: number, args: ValidationArguments): boolean {
    let { totalQuantity } = args.object as CreateTicketTypeInput;

    return availableQuantity <= totalQuantity;
  }

  defaultMessage(): string {
    return "availableQuantity must be less than or equal to totalQuantity";
  }
}

@ValidatorConstraint({ async: false })
export class SaleEndDateValidator implements ValidatorConstraintInterface {
  validate(saleEndDate: Date | string, args: ValidationArguments) {
    let { saleStartDate } = args.object as CreateTicketTypeInput;
    const startDate = new Date(saleStartDate);
    const currentTime = new Date();
    saleEndDate = new Date(saleEndDate);

    return saleEndDate > currentTime && saleEndDate > startDate;
  }

  defaultMessage() {
    return "saleEndDate must be after saleStartDate and current time";
  }
}
