import User from "../models/user.js";

export const users = {
  renderRegisterForm: (req, res) => {
    res.render("users/register");
  },

  register: async (req, res) => {
    try {
      const { username, email, password } = req.body;
      const user = new User({ username, email });
      const registeredUser = await User.register(user, password);
      req.login(registeredUser, (err, next) => {
        if (!registeredUser) return next(err);
        req.flash(
          "success",
          `Welcome to yelpcamp, ${registeredUser.username}!`
        );
        res.redirect("/campgrounds");
      });
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/register");
    }
  },

  renderLoginForm: (req, res) => {
    res.render("users/login");
  },

  login: (req, res) => {
    req.flash("success", `Welcome back, ${req.body.username}!`);
    const redirectUrl = req.session.returnTo || "/campgrounds";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
  },

  logout: (req, res) => {
    req.logout();
    req.flash("success", "Successfully Logged Out!");
    res.redirect("/campgrounds");
  },
};
