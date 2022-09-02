import paginate from "express-paginate";
import { v2 as cloudinary } from "cloudinary";
import nominatim from "nominatim-client";

import Campground from "../models/Campground.js";
import mongoose from "mongoose";

const client = nominatim.createClient({
  useragent: "Yelpcamp",
  referer: "http://localhost:3000/campgrounds",
});

export const campgrounds = {
  index: async function index(req, res) {
    let searchValue = "";
    if (req.query.searchValue) {
      searchValue = req.query.searchValue;
    }
    const [campgrounds, campgroundsBatch] = await Promise.all([
      Campground.find({ title: { $regex: searchValue, $options: "i" } }),
      Campground.find({ title: { $regex: searchValue, $options: "i" } })
        .limit(req.query.limit)
        .skip(req.skip)
        .lean()
        .exec()
    ]);

    const itemCount = campgrounds.length;
    const pageCount = Math.ceil(itemCount / req.query.limit);

    res.render("./campgrounds/index", {
      campgrounds,
      campgroundsBatch,
      pageCount,
      itemCount,
      pages: paginate.getArrayPages(req)(5, pageCount, req.query.page)
    });
  },

  renderNewForm: (req, res) => {
    res.render("./campgrounds/new");
  },

  create: async (req, res) => {
    const query = {
      q: req.body.location,
      addressdetails: "1",
      limit: 1,
    };
    const [geoData] = await client.search(query);
    const geometry = { type: "Point", coordinates: [geoData.lon, geoData.lat] };
    const { title, location, price, description } = req.body;
    const campground = new Campground({
      title,
      location,
      price,
      description,
    });
    campground.geometry = geometry;
    campground.images = req.files.map((file) => ({
      url: file.path,
      filename: file.filename,
    }));
    campground.author = req.user._id;
    await campground.save();
    req.flash("success", "Campground successfully created!");
    res.redirect(`/campgrounds/${campground._id}`);
  },

  show: async (req, res) => {
    const campground = await Campground.findById(req.params.id)
      .populate({
        path: "reviews",
        populate: {
          path: "author",
        },
      })
      .populate("author");
    if (!campground) {
      req.flash("error", "Campground not found");
      return res.redirect("/campgrounds");
    }
    res.render("./campgrounds/show", { campground });
  },

  renderEditForm: async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
      req.flash("error", "Campground not found");
      return res.redirect("/campgrounds");
    }
    res.render("./campgrounds/edit.ejs", { campground });
  },

  edit: async (req, res) => {
    const { title, location, price, description } = req.body;
    const newCampground = await Campground.findByIdAndUpdate(req.params.id, {
      title,
      location,
      price,
      description,
    });
    const newImages = req.files.map((file) => ({
      url: file.path,
      filename: file.filename,
    }));
    newCampground.images.push(...newImages);
    await newCampground.save();
    if (req.body.deleteImages) {
      for (let filename of req.body.deleteImages) {
        cloudinary.uploader.destroy(filename);
      }
      await newCampground.updateOne({
        $pull: { images: { filename: { $in: req.body.deleteImages } } },
      });
    }
    if (!newCampground) {
      req.flash("error", "Campground not found");
      return res.redirect("/campgrounds");
    }
    req.flash("success", "Campground successfully edited!");
    res.redirect(`/campgrounds/${newCampground._id}`);
  },

  delete: async (req, res) => {
    const campground = await Campground.findByIdAndDelete(req.params.id);
    if (!campground) {
      req.flash("error", "Campground not found");
      return res.redirect("/campgrounds");
    }
    req.flash("success", "Campground successfully deleted!");
    res.redirect("/campgrounds");
  },
};
