const express = require('express');
const launchesRouter = express.Router();
const {
  httpGetLaunches,
  httpPostLaunch,
  httpDeleteLaunch,
} = require('./launches.controller');

launchesRouter.get('/', httpGetLaunches);
launchesRouter.post('/', httpPostLaunch);
launchesRouter.delete('/:id', httpDeleteLaunch);

module.exports = launchesRouter;
