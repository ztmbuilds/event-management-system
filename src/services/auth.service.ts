import { Repository } from "typeorm";
import { AppDataSource } from "../database";
import { User } from "../entities/user.entity";
import { IUserLogin, IUserSignup } from "../types";
import { ConflictError, UnauthorizedError } from "../utils/error";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";

export class AuthService {
  private userRepository: Repository<User>;
  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  async signup(data: IUserSignup) {
    const { name, email, password } = data;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser)
      throw new ConflictError("User with that email already exists");

    const newUser = this.userRepository.create({
      name,
      email,
      password,
    });

    await this.userRepository.insert(newUser);

    return newUser;
  }

  async login(data: IUserLogin) {
    const { email, password } = data;

    const user = await this.userRepository.findOneBy({
      email,
    });

    const isCorrect = await bcrypt.compare(password, user.password);
    if (!user || !isCorrect)
      throw new UnauthorizedError("Invalid login credentials");

    const token = jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: "1d",
    });

    return { user, token };
  }
}
