import mongoose, {
  Document,
  Model,
  Schema,
} from "mongoose";

export type BillStatus =
  | "DRAFT"
  | "GENERATED"
  | "PAID"
  | "CANCELLED";

export type PaymentMethod =
  | "CASH"
  | "UPI"
  | "CARD"
  | "OTHER";

export interface IBill extends Document {
  restaurantId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  tableId: mongoose.Types.ObjectId;

  billNumber: number;

  subtotal: number;
  tax: number;
  discount: number;
  total: number;

  paymentStatus:
    | "PENDING"
    | "PAID"
    | "FAILED"
    | "REFUNDED";

  paymentMethod?: PaymentMethod;

  status: BillStatus;

  paidAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const BillSchema = new Schema<IBill>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },

    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
      index: true,
    },

    tableId: {
      type: Schema.Types.ObjectId,
      ref: "Table",
      required: true,
      index: true,
    },

    billNumber: {
      type: Number,
      required: true,
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    tax: {
      type: Number,
      default: 0,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentStatus: {
      type: String,
      enum: [
        "PENDING",
        "PAID",
        "FAILED",
        "REFUNDED",
      ],
      default: "PENDING",
      index: true,
    },

    paymentMethod: {
      type: String,
      enum: [
        "CASH",
        "UPI",
        "CARD",
        "OTHER",
      ],
    },

    status: {
      type: String,
      enum: [
        "DRAFT",
        "GENERATED",
        "PAID",
        "CANCELLED",
      ],
      default: "DRAFT",
      index: true,
    },

    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

BillSchema.index(
  { restaurantId: 1, billNumber: 1 },
  { unique: true }
);

const Bill: Model<IBill> =
  mongoose.models.Bill ||
  mongoose.model<IBill>("Bill", BillSchema);

export default Bill;