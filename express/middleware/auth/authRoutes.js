const prisma = require("../../../prisma");
const express = require("express");
const router = express.Router();
const { createToken, verifyToken } = require("./token");

// TODO -- add routes for token verification and user registration/login

module.exports = router;
