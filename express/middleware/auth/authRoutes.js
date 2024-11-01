const express = require("express");
const router = express.Router();
const { createToken, verifyToken } = require("./token");

router.use(verifyToken);

router.post("/register", async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.register(username, password);
    const token = createToken(user.id);
    res.status(201).json({ token });
  } catch (e) {
    next(e);
  }
});

router.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.login(username, password);
    const token = createToken(user.id);
    res.json({ token });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
