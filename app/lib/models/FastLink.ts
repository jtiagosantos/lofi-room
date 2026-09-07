import mongoose, { Schema, Document, Types } from "mongoose";

export interface IFastLink extends Document {
  userId: Types.ObjectId;
  label: string;
  url: string;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const FastLinkSchema = new Schema<IFastLink>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    label: { type: String, required: true },
    url: { type: String, required: true },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    collection: "fast-links",
  }
);

if (mongoose.models.FastLink) {
  delete mongoose.models.FastLink;
}

export const FastLink = mongoose.model<IFastLink>("FastLink", FastLinkSchema);
