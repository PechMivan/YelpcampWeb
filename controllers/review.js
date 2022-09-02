import Campground from "../models/Campground.js";
import Review from "../models/review.js";

export const reviews = {
  create: async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const { body, rating } = req.body;
    const review = new Review({ body, rating });
    review.author = req.user._id;
    campground.reviews.push(review);
    campground.save();
    review.save();
    req.flash("success", "Comment created!");
    res.redirect(`/campgrounds/${campground._id}`);
  },

  delete: async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Comment deleted!");
    res.redirect(`/campgrounds/${id}`);
  },
};
