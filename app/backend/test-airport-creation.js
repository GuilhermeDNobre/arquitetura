// test-airport-creation.js

const http = require('http');

const airports = [
  {
    code: 'JFK',
    name: 'John F. Kennedy International Airport',
    city: 'New York',
    country: 'USA',
    latitude: 40.6413,
    longitude: -73.7781
  },
  {
    code: 'LAX',
    name: 'Los Angeles International Airport',
    city: 'Los Angeles',
    country: 'USA',
    latitude: 33.9425,
    longitude: -118.4081
  },
  {
    code: 'GRU',
    name: 'São Paulo/Guarulhos International Airport',
    city: 'São Paulo',
    country: 'Brazil',
    latitude: -23.4356,
    longitude: -46.4731
  }
];

function createAirport(airport) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(airport);

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/airports',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        console.log(`Created airport ${airport.code}:`, body);
        resolve();
      });
    });

    req.on('error', (e) => {
      console.error(`Problem creating airport ${airport.code}:`, e.message);
      reject(e);
    });

    req.write(data);
    req.end();
  });
}

async function createAllAirports() {
  for (const airport of airports) {
    try {
      await createAirport(airport);
    } catch (error) {
      console.error('Failed to create airport:', error);
    }
  }
}

createAllAirports();