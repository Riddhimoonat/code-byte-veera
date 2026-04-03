import mongoose from 'mongoose';

const policeStationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Station name is required'],
      trim: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    phone: {
      type: String,
      required: [true, 'Station phone is required'],
      trim: true,
    },
    zone: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const PoliceStation = mongoose.model('PoliceStation', policeStationSchema);

export default PoliceStation;
