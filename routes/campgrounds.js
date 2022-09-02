import express from "express";
import multer from "multer";

import { campgrounds } from "../controllers/campground.js";
import { isAuthor, validateCampground, isLoggedIn, saveUrl } from "../middleware.js";
import { catchAsync } from "../utils/catchAsync.js";
import { storage } from "../cloudinary/index.js";

const upload = multer({ storage });
const router = express.Router();

router
  .route("/")
  .get(saveUrl, campgrounds.index)
  .post(
    isLoggedIn,
    upload.array("image"),
    validateCampground,
    catchAsync(campgrounds.create)
  );

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router
  .route("/:id")
  .get(saveUrl, catchAsync(campgrounds.show))
  .put(
    upload.array("image"),
    validateCampground,
    isAuthor,
    catchAsync(campgrounds.edit)
  )
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.delete));

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.renderEditForm)
);

export { router };
