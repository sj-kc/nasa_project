const express = require('express');

const planetsRouter = require('./planets/planets.router');
const launchesRouter = require('./launches/launches.router');

const APIv1 = express.Router();

APIv1.use('/planets', planetsRouter);
APIv1.use('/launches', launchesRouter);

module.exports = APIv1;
