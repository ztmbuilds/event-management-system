import { Venue } from "../entities/venue.entity";
import { AbstractRepository } from "./abstract.repository";

export class VenueRepository extends AbstractRepository<Venue> {}

export default new VenueRepository(Venue);
