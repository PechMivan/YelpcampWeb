import express from "express";

import { reviews } from "../controllers/review.js";
import { isLoggedIn, validateReview, isReviewAuthor } from "../middleware.js";
import { catchAsync } from "../utils/catchAsync.js";

const router = express.Router({ mergeParams: true });

router.post("/", isLoggedIn, validateReview, catchAsync(reviews.create));

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(reviews.delete)
);

export { router };
