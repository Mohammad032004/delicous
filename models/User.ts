import mongoose, { Document, Model, Schema } from "mongoose";

export type UserRole =
  | "SUPER_ADMIN"
  | "RESTAURANT_OWNER"
  | "MANAGER"
  | "KITCHEN"
  | "WAITER"
  | "CASHIER";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  restaurantId?: mongoose.Types.ObjectId;
  avatar?: string;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: [
        "SUPER_ADMIN",
        "RESTAURANT_OWNER",
        "MANAGER",
        "KITCHEN",
        "WAITER",
        "CASHIER",
      ],
      default: "RESTAURANT_OWNER",
    },

    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      default: null,
    },

    avatar: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
      trim: true,
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

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;