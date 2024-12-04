import sessionRepository, {
  SessionRepository,
} from "../repositories/session.repository";
import {
  CreateSessionInput,
  SessionFilterArgs,
  UpdateSessionInput,
} from "../graphql/typeDefs/session.types";
import eventService from "./event.service";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/error";
import { periodIsWithinPeriod } from "../utils/validate-period";
import { Session } from "../entities/session.entity";
import { MyContext } from "../utils/context";

export class SessionService {
  private readonly sessionRepository: SessionRepository;

  constructor() {
    this.sessionRepository = sessionRepository;
  }

  async createSession(data: CreateSessionInput, ctx: MyContext) {
    const {
      title,
      description,
      date: sessionDate,
      startTime,
      endTime,
      eventId,
    } = data;

    const event = await eventService.getEvent(eventId);

    if (!event) throw new NotFoundError("Event not found");

    if (!ctx.organizerId || event.organizerId !== ctx.organizerId)
      throw new UnauthorizedError(
        "You do not have permission to perfom this action"
      );
    const { startDate, endDate } = event;

    const validPeriod = periodIsWithinPeriod(
      { startDate, endDate },
      { date: sessionDate, startTime, endTime }
    );
    if (!validPeriod) {
      throw new BadRequestError(
        "Invalid session period. Session must be within event period"
      );
    }
    const newSession = new Session();
    newSession.title = title;
    newSession.description = description;
    newSession.date = new Date(sessionDate);
    newSession.startTime = new Date(startTime);
    newSession.endTime = new Date(endTime);
    newSession.eventId = eventId;

    return await this.sessionRepository.save(newSession);
  }

  async updateSession(
    sessionId: string,
    eventId: string,
    data: UpdateSessionInput,
    ctx: MyContext
  ) {
    const event = await eventService.getEvent(eventId);
    if (!event) throw new NotFoundError("Session event not found");

    if (!ctx.organizerId || event.organizerId !== ctx.organizerId)
      throw new UnauthorizedError(
        "You do not have permission to perfom this action"
      );

    const updatedSession = await this.sessionRepository.findOneAndUpdate(
      {
        id: sessionId,
      },
      data
    );

    if (!updatedSession) throw new NotFoundError("No session found");

    return updatedSession;
  }

  async getAllSessionsForEvent(args: SessionFilterArgs, eventId: string) {
    const { data: sessions, pagination } =
      await this.sessionRepository.findPaginatedAndFilter(args, eventId);

    return {
      sessions,
      pagination,
    };
  }

  async getSession(id: string) {
    const session = await this.sessionRepository.findOne({
      where: {
        id,
      },
    });

    return session ? session : null;
  }
}

export default new SessionService();
