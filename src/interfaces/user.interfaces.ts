import { Document } from 'mongoose';

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned',
}

export interface IUser extends Document {
  email: string;
  password: string;

  metadata: {
    status: UserStatus;
    verified: boolean;
  };

  createdAt: Date;
  updatedAt: Date;
}
