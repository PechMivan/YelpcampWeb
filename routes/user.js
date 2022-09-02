import express from "express";
import passport from "passport";

import { users } from "../controllers/user.js";
import { catchAsync } from "../utils/catchAsync.js";
import { saveUrl } from "../middleware.js";

const router = express.Router();

router
  .route("/register")
  .get(users.renderRegisterForm)
  .post(catchAsync(users.register));

router
  .route("/login")
  .get(users.renderLoginForm)
  .post(
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    users.login
  );

router.get("/logout", users.logout);

export { router };
