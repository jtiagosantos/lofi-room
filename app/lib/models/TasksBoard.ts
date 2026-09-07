import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITask {
  _id: string;
  content: string;
}

export interface IColumn {
  _id: string;
  title: string;
  tasks: ITask[];
}

export interface ITasksBoard extends Document {
  userId: Types.ObjectId;
  columns: IColumn[];
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    _id: { type: String, required: true },
    content: { type: String, required: true },
  },
  { _id: false }
);

const ColumnSchema = new Schema<IColumn>(
  {
    _id: { type: String, required: true },
    title: { type: String, required: true },
    tasks: { type: [TaskSchema], default: [] },
  },
  { _id: false }
);

const TasksBoardSchema = new Schema<ITasksBoard>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    columns: { type: [ColumnSchema], default: [] },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    collection: "tasks-board",
  }
);

if (mongoose.models.TasksBoard) {
  delete mongoose.models.TasksBoard;
}

export const TasksBoard = mongoose.model<ITasksBoard>("TasksBoard", TasksBoardSchema);
