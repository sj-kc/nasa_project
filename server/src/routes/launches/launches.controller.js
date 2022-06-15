const {
  getAllLaunches,
  addNewLaunch,
  removeLaunch,
} = require('../../models/launches.model');
const { getPagination } = require('../../services/query');

async function httpGetLaunches(req, res) {
  const { skip, limit } = getPagination(req.query);

  const launches = await getAllLaunches(skip, limit);
  return res.status(200).json(launches);
}

async function httpPostLaunch(req, res) {
  const launch = req.body;

  if (
    !launch.mission ||
    !launch.rocket ||
    !launch.launchDate ||
    !launch.target
  ) {
    return res.status(400).json({
      error: true,
    });
  }

  const launchDate = new Date(launch.launchDate);

  if (isNaN(launchDate)) {
    return res.status(400).json({
      error: true,
    });
  }

  const props = {
    ...launch,
    launchDate,
  };

  await addNewLaunch(props);
  return res.status(201).json(launch);
}

async function httpDeleteLaunch(req, res) {
  const id = Number(req.params.id);
  const launch = await removeLaunch(id);

  if (!launch) {
    return res.status(400).json({
      error: true,
    });
  }

  return res.end();
}

module.exports = {
  httpGetLaunches,
  httpPostLaunch,
  httpDeleteLaunch,
};
