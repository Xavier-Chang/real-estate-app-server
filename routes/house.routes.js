const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const House = require("../models/House.model");

//  POST /api/houses  -  Creates a new house
router.post("/houses", (req, res, next) => {
  const {
    image,
    price,
    rooms,
    size,
    description,
    location,
    constructionYear,
    hasGarage,
    madeByMe,
  } = req.body;

  House.create({ 
    image,
    price,
    rooms,
    size,
    description,
    location,
    constructionYear,
    hasGarage,
    madeByMe })
    .then((response) => res.json(response))
    .catch((err) => res.json(err));
});

//  GET /api/houses -  Retrieves all of the houses
router.get("/houses", (req, res, next) => {
  House.find()
    .then((allhouses) => res.json(allhouses))
    .catch((err) => res.json(err));
});

//  GET /api/houses/:houseId -  Retrieves a specific house by id
router.get("/houses/:houseId", (req, res, next) => {
  const { houseId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(houseId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  // Each House document has `tasks` array holding `_id`s of Task documents
  // We use .populate() method to get swap the `_id`s for the actual Task documents
  House.findById(houseId)
    .then((house) => res.status(200).json(house))
    .catch((error) => res.json(error));
});


// DELETE  /api/houses/:houseId  -  Deletes a specific house by id
router.delete("/houses/:houseId", (req, res, next) => {
  const { houseId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(houseId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  House.findByIdAndRemove(houseId)
    .then(() =>
      res.json({
        message: `House with ${houseId} is removed successfully.`,
      })
    )
    .catch((error) => res.json(error));
});

module.exports = router;
