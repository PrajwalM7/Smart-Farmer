const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  name: String,
  phone: String,
  village: String,
  district: String,
  state: String,
  farmSize: String,
  soilType: String,
  preferredCrop: String,
});

module.exports = mongoose.model("Profile", profileSchema);