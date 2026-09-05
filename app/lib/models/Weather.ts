import mongoose, { Schema, Document, Types } from "mongoose";

export interface IWeather extends Document {
  userId: Types.ObjectId;
  cep: string;
  createdAt: Date;
  updatedAt: Date;
}

const WeatherSchema = new Schema<IWeather>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    cep: { type: String, required: true },
  },
  {
    timestamps: true,
    collection: "weathers",
  }
);

if (mongoose.models.Weather) {
  delete mongoose.models.Weather;
}

export const Weather = mongoose.model<IWeather>("Weather", WeatherSchema);
