import { injectable, inject } from 'tsyringe';

import AppError from '@shared/error/AppError';

import User from '../infra/typeorm/entities/User';
import IUserRepository from '../repositories/IUsersRepository';
import IHashProvider from '../providers/HashProvider/models/IHashProvider';

interface IRequest {
  user_id: string;
  name?: string;
  email?: string;
  old_password?: string;
  password?: string;
}

@injectable()
class UpdateUserProfileService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUserRepository,

    @inject('HashProvider')
    private hashProvider: IHashProvider,
  ) {}

  public async execute({
    user_id,
    name,
    email,
    old_password,
    password,
  }: IRequest): Promise<User> {
    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new AppError('User not found');
    }

    if (email) {
      const emailIsUsed = await this.usersRepository.findByEmail(email);

      if (emailIsUsed) {
        throw new AppError('Email already in use');
      }

      user.email = email;
    }

    if (name) {
      user.name = name;
    }

    if (password && !old_password) {
      throw new AppError('You need to inform old password');
    }

    if (password && old_password) {
      const checkPassword = await this.hashProvider.compareHash(
        old_password,
        user.password,
      );

      if (!checkPassword) {
        throw new AppError('Passwords dont match');
      }

      user.password = await this.hashProvider.generateHash(password);
    }

    await this.usersRepository.save(user);

    return user;
  }
}

export default UpdateUserProfileService;
