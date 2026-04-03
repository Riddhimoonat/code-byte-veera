import mongoose from 'mongoose';

const smsLogSchema = new mongoose.Schema(
  {
    sos_event_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SOSEvent',
      required: true,
    },
    recipient_phone: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['sent', 'failed', 'pending'],
      default: 'pending',
    },
    sent_at: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const SMSLog = mongoose.model('SMSLog', smsLogSchema);

export default SMSLog;
