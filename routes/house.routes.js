const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const cloudinary = require("../cloudinary.config");

const House = require("../models/House.model");

const upload = multer({ storage: multer.memoryStorage() });

//  POST /api/houses  -  Creates a new house
router.post("/houses", upload.single("housePicture"), async (req, res, next) => {
  try {
    const {
      streetName,
      houseNumber,
      numberAddition,
      price,
      size,
      description,
      constructionYear,
      hasGarage,
      madeBy,
    } = req.body;

    const rooms = {
      bedrooms: req.body['bedrooms'],
      bathrooms: req.body['bathrooms'],
    };

    const location = {
      street: `${streetName} ${houseNumber}${numberAddition ? ' ' + numberAddition : ''}`,
      city: req.body['city'],
      zip: req.body['zip'],
    };

    // Check if the image file exists in the request
    if (!req.file) {
      return res.status(400).json({ message: "Image file is missing" });
    }

    // Upload the image to Cloudinary
    const result = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`, // Add the mimetype and prefix
      { resource_type: "image" }
    );

    // Create a new house with the uploaded image URL
    const house = await House.create({
      image: result.secure_url,
      price,
      rooms,
      size,
      description,
      location,
      constructionYear,
      hasGarage,
      madeBy,
    });

    res.json(house);
  } catch (err) {
    console.error("Error in POST /api/houses:", err);
    res.status(500).json({ message: "Internal server error", error: err });
  }
});

//  PUT /api/houses/:houseId - Updates a specific house by id
router.put("/houses/:houseId", upload.single("housePicture"), async (req, res, next) => {
  const { houseId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(houseId)) {
    res.status(400).json({ message: "Specified id is not valid" });
    return;
  }

  const {
    streetName,
    houseNumber,
    numberAddition,
    price,
    size,
    description,
    constructionYear,
    hasGarage,
    madeBy,
  } = req.body;

  const rooms = {
    bedrooms: req.body['bedrooms'],
    bathrooms: req.body['bathrooms'],
  };

  const location = {
    street: `${streetName} ${houseNumber}${numberAddition ? ' ' + numberAddition : ''}`,
    city: req.body['city'],
    zip: req.body['zip'],
  };

  const updateData = {
    price,
    rooms,
    size,
    description,
    location,
    constructionYear,
    hasGarage,
    madeBy,
  };

  // Check if the image file exists in the request
  if (req.file) {
    // Upload the image to Cloudinary
    const result = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`, // Add the mimetype and prefix
      { resource_type: "image" }
    );

    // Add the uploaded image URL to the update data
    updateData.image = result.secure_url;
  }

  // Update the house with the new data
  House.findByIdAndUpdate(houseId, updateData, { new: true })
    .then((updatedHouse) => res.status(200).json(updatedHouse))
    .catch((error) => res.json(error));
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
