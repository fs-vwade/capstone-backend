// authentication function
function authenticate(req, res, next) {
  if (req.user) {
    next();
  } else {
    next({ status: 401, message: "You must be logged in." });
  }
}
module.exports = (req, res, next) => {}; // intentionally left blank
