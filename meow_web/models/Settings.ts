import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  name: String,
  avatar: {
    type: String,
    default: 'users-1.svg',
  },
  mode: {
    type: String,
    enum: ['countup', 'countdown'],
    default: 'countup',
  },
  widgets: {
    tasks: { type: Boolean, default: true },
    activity: { type: Boolean, default: true },
    rain: { type: Boolean, default: true },
    tabHistory: { type: Boolean, default: true },
  }
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);
