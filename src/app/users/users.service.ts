import connect from '@/lib/mongodb';
import { User } from '@/models';
import UserEntity from './user.entity';

export default class UsersService {
  async getAllUsers() {
    await connect();
    return User.find(
      {},
      {
        email: 1,
        metadata: 1,
        createdAt: 1,
        updatedAt: 1,
      }
    ).lean();
  }

  async getUserById(id: string) {
    await connect();
    return User.findById(id, {
      email: 1,
      metadata: 1,
      createdAt: 1,
      updatedAt: 1,
    }).lean();
  }

  async createUserWithPassword(userData: { email: string; password: string }) {
    const user = new UserEntity(userData);
    await connect();
    await User.create(user);

    return {
      email: user.email,
      status: user.metadata.status,
      verified: user.isVerified(),
    };
  }
}
