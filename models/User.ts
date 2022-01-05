import { model, Schema } from "mongoose";

const UserSchema = new Schema({
  name: String,
  points: { type: Number, default: 0 },
});

export const User = model("User", UserSchema);
