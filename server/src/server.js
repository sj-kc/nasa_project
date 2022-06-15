require('dotenv').config();
const mongoose = require('mongoose');
const http = require('http');
const app = require('./app.js');
const { loadPlanetsData } = require('./models/planets.model.js');
const { loadLaunchesData } = require('./models/launches.model.js');

const server = http.createServer(app);

const PORT = process.env.PORT || 8080;
const MONGO_URL = process.env.MONGO_URL;

// Emits events
mongoose.connection.once('open', () => {
  console.log('mongo db connection ready');
});

mongoose.connection.on('error', (err) => {
  console.error(err);
});

async function startServer() {
  await mongoose.connect(MONGO_URL);
  await loadPlanetsData();
  await loadLaunchesData();

  server.listen(PORT, () => console.log(`server is connected ${PORT}`));
}

startServer();
