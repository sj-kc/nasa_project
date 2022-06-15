const axios = require('axios');
const launches = require('./launches.mongo');
const planets = require('./planets.mongo');

async function loadLaunchesData() {
  const SPACEX_URL = 'https://api.spacexdata.com/v4/launches/query';

  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: 'Falcon 1',
    missiong: 'FalconSat',
  });

  if (firstLaunch) return;

  const response = await axios.post(SPACEX_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: 'rocket',
          select: {
            name: 1,
          },
        },
        {
          path: 'payloads',
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  if (response.status !== 200) {
    console.log('problem downloading launch data');
    throw new Error('SpaceX API down');
  }

  const launchDocs = response.data.docs;

  for (const launchDoc of launchDocs) {
    const payloads = launchDoc['payloads'];
    const customers = payloads.flatMap((payload) => {
      return payload['customers'];
    });

    const launch = {
      flightNumber: launchDoc['flight_number'],
      mission: launchDoc['name'],
      rocket: launchDoc['rocket']['name'],
      launchDate: launchDoc['date_local'],
      upcoming: launchDoc['upcoming'],
      success: launchDoc['success'],
      customers,
    };

    await saveLaunch(launch);
  }
}

async function findLaunch(filter) {
  return await launches.findOne(filter);
}

async function getAllLaunches(skip, limit) {
  return await launches
    .find({}, { __id: 0, __v: 0 })
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
}

async function getLatestFlightNumber() {
  const latestLaunch = await launches.findOne().sort('-flightNumber');

  if (!latestLaunch) return 1;

  return latestLaunch?.flightNumber;
}

async function saveLaunch(launch) {
  return await launches.updateOne(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
}

async function addNewLaunch(flight) {
  const planet = await planets.findOne({
    keplerName: flight.target,
  });

  if (!planet) throw new Error('Planet not found');

  const flightNumber = (await getLatestFlightNumber()) + 1;

  const launch = {
    ...flight,
    flightNumber,
    customer: ['NASA'],
    upcoming: true,
    success: true,
  };

  return await saveLaunch(launch);
}

async function removeLaunch(id) {
  const flight = await launches.findOne({ flightNumber: id });

  if (!flight) return;

  const aborted = await launches.updateOne(
    {
      flightNumber: id,
    },
    {
      upcoming: false,
      success: false,
    }
  );

  return aborted.acknowledged;
}

module.exports = {
  loadLaunchesData,
  getAllLaunches,
  saveLaunch,
  addNewLaunch,
  removeLaunch,
};
