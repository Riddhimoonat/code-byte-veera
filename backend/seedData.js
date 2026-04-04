import mongoose from 'mongoose';
import SOSEvent from './src/models/SOSEvent.model.js';
import dotenv from 'dotenv';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/veera');
    console.log('Connected to MongoDB');

    // Clear existing data
    await SOSEvent.deleteMany({});
    console.log('Cleared existing SOS events');

    // Create sample SOS events
    const sampleEvents = [
      {
        latitude: 40.7128,
        longitude: -74.0060,
        hour: 9
      },
      {
        latitude: 40.7580,
        longitude: -73.9855,
        hour: 11
      },
      {
        latitude: 40.6892,
        longitude: -74.0445,
        hour: 14
      },
      {
        latitude: 40.7489,
        longitude: -73.9680,
        hour: 16
      },
      {
        latitude: 40.7831,
        longitude: -73.9712,
        hour: 18
      },
      {
        latitude: 40.7061,
        longitude: -73.9969,
        hour: 20
      },
      {
        latitude: 40.7282,
        longitude: -73.9942,
        hour: 22
      },
      {
        latitude: 40.7411,
        longitude: -73.9903,
        hour: 23
      },
      {
        latitude: 40.7549,
        longitude: -73.9840,
        hour: 8
      },
      {
        latitude: 40.7614,
        longitude: -73.9776,
        hour: 13
      }
    ];

    await SOSEvent.insertMany(sampleEvents);
    console.log('Sample SOS events created successfully');

    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
