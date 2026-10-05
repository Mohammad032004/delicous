import mongoose, { Document, Model, Schema } from "mongoose";

export type TableStatus =
  | "AVAILABLE"
  | "OCCUPIED"
  | "BILL_REQUESTED"
  | "CLEANING";

export interface ITable extends Document {
  restaurantId: mongoose.Types.ObjectId;

  name: string;
  number: number;

  capacity: number;

  qrToken: string;

  status: TableStatus;

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const TableSchema = new Schema<ITable>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    number: {
      type: Number,
      required: true,
      min: 1,
    },

    capacity: {
      type: Number,
      default: 4,
      min: 1,
    },

    qrToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    status: {
      type: String,
      enum: [
        "AVAILABLE",
        "OCCUPIED",
        "BILL_REQUESTED",
        "CLEANING",
      ],
      default: "AVAILABLE",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

TableSchema.index(
  { restaurantId: 1, number: 1 },
  { unique: true }
);

const Table: Model<ITable> =
  mongoose.models.Table ||
  mongoose.model<ITable>("Table", TableSchema);

export default Table;