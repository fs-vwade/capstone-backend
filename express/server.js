require("dotenv").config();

const express = require("express");
const app = express();
const PORT = 3000;

const routes = require("./routes");
const { errorHandler } = require("./middleware");

app.use(routes);

app.use(errorHandler);

app.listen(PORT);
