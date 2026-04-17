import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  focusTime: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);
