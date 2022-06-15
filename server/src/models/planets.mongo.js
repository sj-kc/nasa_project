const mongoose = require('mongoose');

const planetsSchema = new mongoose.Schema({
  keplerName: {
    type: String,
    required: true,
  },
});

// It has to be always in singular form of the collection and uppercase
module.exports = mongoose.model('Planet', planetsSchema);
