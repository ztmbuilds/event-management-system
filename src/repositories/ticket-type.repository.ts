import { TicketType } from "../entities/ticket-type.entity";

import { AbstractRepository } from "./abstract.repository";

export class TicketTypeRepository extends AbstractRepository<TicketType> {}

export default new TicketTypeRepository(TicketType);
