import { UserStatus } from '@/interfaces/user.interfaces';
import bcrypt from 'bcrypt';

export default class UserEntity {
  email: string;
  private password: string;
  metadata: {
    status: UserStatus;
    verified: boolean;
  };

  constructor(
    data: {
      email: string;
      password: string;
      metadata?: { status?: UserStatus; verified?: boolean };
    },
    encrypt = true
  ) {
    this.email = data.email;
    this.password = encrypt
      ? UserEntity.encryptPassword(data.password)
      : data.password;
    this.metadata = {
      status: data.metadata?.status ?? UserStatus.ACTIVE,
      verified: data.metadata?.verified ?? false,
    };
  }

  static encryptPassword(password: string): string {
    const saltRounds = 12;
    return bcrypt.hashSync(password, saltRounds);
  }

  resetPassword(password: string) {
    this.password = UserEntity.encryptPassword(password);
  }

  isVerified() {
    return this.metadata.verified;
  }

  verify() {
    this.metadata.verified = true;
  }

  isActive() {
    return this.metadata.status === UserStatus.ACTIVE;
  }

  isInactive() {
    return this.metadata.status === UserStatus.INACTIVE;
  }

  isBanned() {
    return this.metadata.status === UserStatus.BANNED;
  }

  activate() {
    this.metadata.status = UserStatus.ACTIVE;
  }

  deactivate() {
    this.metadata.status = UserStatus.INACTIVE;
  }

  ban() {
    this.metadata.status = UserStatus.BANNED;
  }

  toJSON() {
    return {
      email: this.email,
      password: this.password,
      metadata: this.metadata,
    };
  }
}
