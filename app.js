require("dotenv/config");
require("./db");
const express = require("express");

const app = express();
require("./config")(app);


// 👇 Start handling routes here
const allRoutes = require("./routes");
app.use("/api", allRoutes);

const houseRouter = require("./routes/house.routes");
app.use("/api", houseRouter);


require("./error-handling")(app);

module.exports = app;
