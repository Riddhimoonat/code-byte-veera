import { getRiskScore } from './src/services/ml.service.js';

const run = async () => {
  console.log("Mock Data: Latitude: 28.7041, Longitude: 77.1025, Time: " + new Date().getHours());
  console.log("Sending mock data to ML service...");
  
  const lat = 28.7041;
  const lng = 77.1025;
  const timestamp = new Date().getHours();
  
  const start = Date.now();
  const response = await getRiskScore(lat, lng, timestamp, false);
  const duration = Date.now() - start;
  
  console.log(`Response received in ${duration}ms:`);
  console.log(JSON.stringify(response, null, 2));
}

run();
