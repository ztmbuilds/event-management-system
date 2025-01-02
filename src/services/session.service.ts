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
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/error";
import { periodIsWithinPeriod } from "../utils/validate-period";
import { Session, SessionStatus } from "../entities/session.entity";
import { MyContext } from "../utils/context";
import speakerService from "./speaker.service";

export class SessionService {
  constructor(private readonly sessionRepository: SessionRepository) {}

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

  async addSpeaker(sessionId: string, speakerId: string) {
    const session = await this.sessionRepository.findOne({
      where: {
        id: sessionId,
      },
      relations: {
        speakers: true,
      },
    });
    if (!session) throw new NotFoundError("Session not found");
    const speaker = await speakerService.getSpeaker(speakerId);

    if (!speaker) throw new NotFoundError("Speaker not found");

    session.speakers.push(speaker);

    return await this.sessionRepository.save(session);
  }

  async removeSpeaker(sessionId: string, speakerId: string) {
    const session = await this.sessionRepository.findOne({
      where: {
        id: sessionId,
      },
      relations: {
        speakers: true,
      },
    });
    if (!session) throw new NotFoundError("Session not found");

    if (session.status === SessionStatus.COMPLETED)
      throw new ConflictError(
        "You cannot remove a speaker from a session that has been completed"
      );

    const speaker = await speakerService.getSpeaker(speakerId);

    if (!speaker) throw new NotFoundError("Speaker not found");

    session.speakers = session.speakers.filter(
      (speaker) => speaker.id !== speakerId
    );

    return await this.sessionRepository.save(session);
  }
}

export default new SessionService(sessionRepository);
