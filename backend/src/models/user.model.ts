import { Schema, model } from "mongoose";
import { IUserDocument } from "../types/user.interface";
import { UserRole } from "../constants/roles.enum";

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER
    },
    interests: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: Record<string, any>) => {
        delete ret.password;
        return ret;
      }
    }
  }
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ interests: 1 });

export const UserModel = model<IUserDocument>("User", UserSchema);
