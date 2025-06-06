import { IUser, UserStatus } from '@/interfaces/user.interfaces';
import mongoose, { Schema } from 'mongoose';

const userSchema: Schema<IUser> = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    metadata: {
      status: {
        type: String,
        enum: UserStatus,
        default: UserStatus.ACTIVE,
        required: true,
      },
      verified: {
        type: Boolean,
        default: false,
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ email: 1 });

const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
