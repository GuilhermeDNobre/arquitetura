// test-flight-creation.js

const http = require('http');

const data = JSON.stringify({
  id: 'FL123',
  departurePoint: 'JFK',
  destination: 'LAX',
  departureTime: '2026-01-12T10:00:00Z',
  arrivalTime: '2026-01-12T13:00:00Z',
  company: 'Airlines Inc'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/flights',
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