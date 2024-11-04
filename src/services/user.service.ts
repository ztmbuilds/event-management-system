import { Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { AppDataSource } from "../database";

export class UserService {
  private userRepository: Repository<User>;
  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  async getUser(id: string) {
    return await this.userRepository.findOneBy({
      id,
    });
  }
}
