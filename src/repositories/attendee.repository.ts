import { Attendee } from "../entities/attendee.entity";
import { AbstractRepository } from "./abstract.repository";

export class AttendeeRepository extends AbstractRepository<Attendee> {}

export default new AttendeeRepository(Attendee);
