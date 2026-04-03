import mongoose from 'mongoose';

const sosEventSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    risk_level: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
    status: {
      type: String,
      enum: ['active', 'dispatched', 'resolved'],
      default: 'active',
    },
    triggered_at: {
      type: Date,
      default: Date.now,
    },
    resolved_at: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const SOSEvent = mongoose.model('SOSEvent', sosEventSchema);

export default SOSEvent;
