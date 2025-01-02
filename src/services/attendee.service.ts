import { Attendee, CheckinStatus } from "../entities/attendee.entity";
import attendeeRepository, {
  AttendeeRepository,
} from "../repositories/attendee.repository";
import { MyContext } from "../utils/context";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  UnprocessibleEntityError,
} from "../utils/error";
import { TransactionHandler } from "../utils/transaction";
import eventService from "./event.service";
import ticketTypeService from "./ticket-type.service";
import { PaymentService } from "./payment.service";
import { FindOptionsRelations } from "typeorm";

export class AttendeeService {
  constructor(private readonly attendeeRepository: AttendeeRepository) {}

  async registerAttendeeProfileForEvent(
    code: string,
    eventId: string,
    ctx: MyContext
  ) {
    const attendee = await this.attendeeRepository.findOne({
      where: {
        user: {
          id: ctx.id,
        },
        event: {
          id: eventId,
        },
      },
    });

    if (attendee)
      throw new ConflictError(
        "Attendee profile for this event already exists for this user "
      );

    const event = await eventService.getEvent(eventId);
    if (!event) throw new NotFoundError("event not found");

    const payment = await new PaymentService().getPaymentByCode(code);
    if (!payment) throw new NotFoundError("No payment found with that code");

    const ticketType = await ticketTypeService.getTicketType(
      payment.ticketTypeId
    );

    if (!ticketType) throw new NotFoundError("No ticketType found");
    if (event.id !== ticketType.eventId)
      throw new UnprocessibleEntityError(
        "ticketType does not belong to the event"
      );

    const transanctionHandler = new TransactionHandler();
    await transanctionHandler.startTransaction();

    return transanctionHandler.executeInTransaction(
      async (transactionalEntityManager) => {
        const newAttendee = new Attendee();

        newAttendee.userId = ctx.id;
        newAttendee.eventId = eventId;
        newAttendee.ticketTypeId = payment.ticketTypeId;

        payment.redeemed = true;

        await transactionalEntityManager.save(payment);
        await transactionalEntityManager.save(newAttendee);
        return newAttendee;
      }
    );
  }

  async getAttendee(
    attendeeId: string,
    relations?: FindOptionsRelations<Attendee>
  ) {
    const attendee = await this.attendeeRepository.findOne({
      where: {
        id: attendeeId,
      },
      relations,
    });

    return attendee ? attendee : null;
  }

  async checkInAttendee(attendeeId: string, eventId: string, ctx: MyContext) {
    const attendee = await this.getAttendee(attendeeId);
    if (!attendee) throw new NotFoundError("Attendee not found");

    const event = await eventService.getEvent(eventId);

    if (!event) throw new NotFoundError("Event not found");
    if (event.id !== attendee.eventId)
      throw new ForbiddenError("Attendee is not registered for this event");

    if (!ctx.organizerId || event.organizerId !== ctx.organizerId)
      throw new UnauthorizedError(
        "You do not have permission to perfom this action"
      );

    attendee.checkInStatus = CheckinStatus.CHECKED_IN;

    await this.attendeeRepository.save(attendee);
    return attendee;
  }
}

export default new AttendeeService(attendeeRepository);
