import mongoose, { Schema, Document, Types } from "mongoose";

export interface IWallpaper extends Document {
  userId: Types.ObjectId;
  url: string;
  createdAt: Date;
  updatedAt: Date;
}

const WallpaperSchema = new Schema<IWallpaper>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    url: { type: String, required: true },
  },
  {
    timestamps: true,
    collection: "wallpapers",
  }
);

if (mongoose.models.Wallpaper) {
  delete mongoose.models.Wallpaper;
}

export const Wallpaper = mongoose.model<IWallpaper>("Wallpaper", WallpaperSchema);
