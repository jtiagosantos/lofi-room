import mongoose, { Schema, Document, Types } from "mongoose";

export interface INote extends Document {
  userId: Types.ObjectId;
  title: string;
  content: string;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INote>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, default: "Nova anotação" },
    content: { type: String, default: "" },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    collection: "notes",
  }
);

if (mongoose.models.Note) {
  delete mongoose.models.Note;
}

export const Note = mongoose.model<INote>("Note", NoteSchema);
