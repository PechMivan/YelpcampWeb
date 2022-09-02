import Campground from "./models/Campground.js";
import Review from "./models/review.js";
import { campgroundSchema } from "./schemas.js";
import { reviewSchema } from "./schemas.js";
import { ExpressError } from "./utils/ExpressError.js";

const isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "You must sign in first!");
    req.session.returnTo = req.originalUrl;
    return res.redirect("/login");
  }
  next();
};

const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(", ");
    console.log(msg);
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(", ");
    console.log(msg);
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

const isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash("error", "Campground not found");
    return res.redirect("/campgrounds");
  }
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "You don't have permission to do that!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

const isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review) {
    req.flash("error", "Review not found");
    return res.redirect("/campgrounds");
  }
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You don't have permission to do that!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

const saveUrl = (req, res, next) => {
  req.session.returnTo = req.originalUrl;
  next();
}

export {
  isLoggedIn,
  validateCampground,
  validateReview,
  isAuthor,
  isReviewAuthor,
  saveUrl,
};
