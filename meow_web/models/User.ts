import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: false, // Optional for OAuth
  },
  image: String,
  emailVerified: Date,
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);
