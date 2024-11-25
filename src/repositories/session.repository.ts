import { Session } from "../entities/session.entity";
import { AbstractRepository } from "./abstract.repository";

export class SessionRepository extends AbstractRepository<Session> {}

export default new SessionRepository(Session);
