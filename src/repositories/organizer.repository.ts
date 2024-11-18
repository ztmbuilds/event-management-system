import { Organizer } from "../entities/organizers.entity";
import { AbstractRepository } from "./abstract.repository";

export class OrganizerRepository extends AbstractRepository<Organizer> {}

export default new OrganizerRepository(Organizer);
