import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  image: string;
  provider: string;
  providerAccountId: string;
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresAt?: number;
  idToken?: string;
  scope?: string;
  lastLoginAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String },
    provider: { type: String, required: true },
    providerAccountId: { type: String, required: true },
    accessToken: { type: String },
    refreshToken: { type: String },
    tokenType: { type: String },
    expiresAt: { type: Number },
    idToken: { type: String },
    scope: { type: String },
    lastLoginAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.User) {
  delete mongoose.models.User;
}

export const User = mongoose.model<IUser>("User", UserSchema);
