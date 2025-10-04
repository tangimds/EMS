const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

const User = require("../models/User");
const config = require("../config");

function getToken(req) {
  // First try to get token from Authorization header
  let token = ExtractJwt.fromAuthHeaderWithScheme("JWT")(req);
  // If no token in header, try to get from cookies
  if (!token && req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  return token;
}

module.exports = function (app) {
  const opts = {};
  opts.jwtFromRequest = getToken;
  opts.secretOrKey = config.SECRET;

  passport.use(
    "user",
    new JwtStrategy(opts, async function (jwtPayload, done) {
      try {
        const user = await User.findOne({ _id: jwtPayload._id });
        if (user) return done(null, user);
      } catch (error) {
        console.error("JWT authentication error:", error);
      }
      return done(null, false);
    })
  );

  app.use(passport.initialize());
};
