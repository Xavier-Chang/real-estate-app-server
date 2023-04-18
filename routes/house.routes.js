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
      price,
      size,
      description,
      constructionYear,
      hasGarage,
      madeByMe,
    } = req.body;

    const rooms = {
      bedrooms: parseInt(req.body['rooms.bedrooms'], 10),
      bathrooms: parseInt(req.body['rooms.bathrooms'], 10),
    };

    const location = {
      street: req.body['location.street'],
      city: req.body['location.city'],
      zip: req.body['location.zip'],
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
      madeByMe,
    });

    res.json(house);
  } catch (err) {
    console.error("Error in POST /api/houses:", err);
    res.status(500).json({ message: "Internal server error", error: err });
  }
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
