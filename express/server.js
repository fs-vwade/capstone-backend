require("dotenv").config();

const express = require("express");
const app = express();
const PORT = 3000;

const { routes, errorHandler } = require("./routes");

app.use(routes);

app.use(errorHandler);

app.listen(PORT);
