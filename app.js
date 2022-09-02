import express from "express";
import engine from "ejs-mate";
import mongoose from "mongoose";
import methodOverride from "method-override";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import MongoStore from "connect-mongo";
import flash from "connect-flash";
import passport from "passport";
import LocalStrategy from "passport-local";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import paginate from "express-paginate";

import { ExpressError } from "./utils/ExpressError.js";
import { router as campgroundRoutes } from "./routes/campgrounds.js";
import { router as reviewRoutes } from "./routes/reviews.js";
import { router as userRoutes } from "./routes/user.js";
import { saveUrl } from "./middleware.js";
import User from "./models/user.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";

async function main() {
  await mongoose.connect(dbUrl);
}

main()
  .then(() => console.log("Connected to MongoDB!"))
  .catch((err) => console.log(err));

app.engine("ejs", engine);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const secret = process.env.SECRET || "thisshouldbeapassword";

const store = new MongoStore({
  mongoUrl: dbUrl,
  secret,
  touchAfter: 24 * 60 * 60,
});

store.on("error", (e) => {
  console.log("Session Store Error: ", e);
})

const sessionOptions = {
  store,
  name: "session",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  },
};

app.use(paginate.middleware(10, 50));
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(mongoSanitize());
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
    originAgentCluster: false,
  })
);

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/review", reviewRoutes);
app.use("/", userRoutes);

app.get("/", saveUrl, (req, res) => {
  res.render("home");
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong";
  res.status(statusCode).render("error", { err });
});

app.listen(port, () => {
  console.log(`Serving from port: ${port}!`);
});