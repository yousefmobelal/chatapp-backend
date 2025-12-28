import { userRepository, type UserRepository } from '@/repositories/user.repository';
import { User } from '@/types/user';
import { AuthUserRegisteredPayload } from '@chatapp/common';

class UserService {
  constructor(private readonly repository: UserRepository) {}

  async syncFromAuthUser(payload: AuthUserRegisteredPayload): Promise<User> {
    const user = await this.repository.upsertFromAuthEvent(payload);

    return user;
  }
}

export const userService = new UserService(userRepository);
