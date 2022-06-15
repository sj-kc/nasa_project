const { parse } = require('csv-parse');
const path = require('path');
const fs = require('fs');

const planets = require('./planets.mongo.js');

function isHabitablePlanet(planet) {
  const confirmed = planet['koi_disposition'] === 'CONFIRMED';
  const planetLigth = planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11;
  const planetSize = planet['koi_prad'] < 1.6;

  return confirmed && planetLigth && planetSize;
}

function loadPlanetsData() {
  new Promise((resolve, reject) => {
    fs.createReadStream(path.join(__dirname, '../../data/kepler_data.csv'))
      .pipe(parse({ comment: '#', columns: true }))
      .on('data', async (data) => {
        if (isHabitablePlanet(data)) {
          await savePlanet(data.kepler_name);
        }
      })
      .on('error', (err) => {
        console.log(err);
        reject(err);
      })
      .on('end', async () => {
        const planetsCounter = await getAllPlanets();
        console.log(`${planetsCounter.length} habitable planets found`);
        resolve();
      });
  });
}

async function getAllPlanets() {
  return await planets.find(
    {},
    {
      _id: 0,
      __v: 0,
    }
  );
}

async function savePlanet(keplerName) {
  try {
    return await planets.updateOne(
      { keplerName },
      { keplerName },
      { upsert: true }
    );
  } catch (error) {
    console.log(err);
  }
}

module.exports = {
  getAllPlanets,
  loadPlanetsData,
};
