import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  async get(id: number): Promise<User> {
    console.log('getting user');
    const user = await this.userRepository.findOne({
      where: { id },
      relations: {
        integrations: true,
      },
    });

    console.log(user);

    if (!user) {
      // TODO create new exception and throw user not foudn error
      throw new Error('User not found');
    }

    return user;
  }
}
