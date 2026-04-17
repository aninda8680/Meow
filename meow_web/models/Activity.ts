import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Optional if we want global tracking or until identified
  },
  app: String,
  domain: String, // For tabs
  title: String,
  duration: Number,
  type: {
    type: String,
    enum: ['app', 'tab'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

export default mongoose.models.Activity || mongoose.model("Activity", ActivitySchema);
