import { AbstractRepository } from "./abstract.repository";
import { User } from "../entities/user.entity";

export class UserRepository extends AbstractRepository<User> {
  // async getOrganizerProfile(id: string) {
  //     const user
  // }
}

export default new UserRepository(User);
