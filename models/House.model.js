const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const houseSchema = new mongoose.Schema({
  image: String,
  price: Number,
  rooms: {
    bedrooms: Number,
    bathrooms: Number
  },
  size: Number,
  description: String,
  location: {
    street: String,
    city: String,
    zip: String
  },
  createdAt: Date,
  constructionYear: Number,
  hasGarage: Boolean,
  madeByMe: Boolean
});

module.exports = model("House", houseSchema);
