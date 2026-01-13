// test-catastrophe.js

const http = require('http');

const catastropheData = JSON.stringify({
  airportCode: 'LAX',
  impactType: 'earthquake',
  severity: 'catastrophic',
  durationMinutes: 120,
  isCatastrophe: true
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/simulate-weather-impact',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': catastropheData.length
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  res.on('data', (chunk) => {
    console.log(`Response: ${chunk}`);
  });
});

req.on('error', (e) => {
  console.error(`Problem with catastrophe simulation: ${e.message}`);
});

req.write(catastropheData);
req.end();