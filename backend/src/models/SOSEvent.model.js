import mongoose from 'mongoose';

const sosEventSchema = new mongoose.Schema(
  {
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    hour: {
      type: Number,
      required: true,
      min: 0,
      max: 23,
    }
  },
  { timestamps: true }
);

const SOSEvent = mongoose.model('SOSEvent', sosEventSchema);

export default SOSEvent;
