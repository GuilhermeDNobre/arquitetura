// test-simulation.js

const http = require('http');

const data = JSON.stringify({
  airportCode: 'JFK',
  impactType: 'storm',
  severity: 'high',
  durationMinutes: 60,
  isCatastrophe: false
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/simulate-weather-impact',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  res.on('data', (chunk) => {
    console.log(`Response: ${chunk}`);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(data);
req.end();