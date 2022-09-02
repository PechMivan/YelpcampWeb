import baseJoi from "joi";
import sanitizeHtml from "sanitize-html";

const extension = (joi) => ({
  type: "string",
  base: joi.string(),
  messages: {
    "string.escapeHTML": "{{#label}} must not include HTML!",
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        // escape symbols only (e.g. &, <)
        const filtered = sanitizeHtml(value, {
          allowedTags: false,
          allowedAttributes: false,
        });
        // remove html
        const clean = sanitizeHtml(filtered, {
          allowedTags: [],
          allowedAttributes: {},
        });
        // show error if html was present/removed
        if (clean !== filtered) return helpers.error("string.escapeHTML");
      },
    },
  },
});

const Joi = baseJoi.extend(extension);

const campgroundSchema = Joi.object({
  title: Joi.string().required().escapeHTML(),
  location: Joi.string().required().escapeHTML(),
  price: Joi.number().required().min(0),
  description: Joi.string().required().escapeHTML(),
  deleteImages: Joi.array()
});

const reviewSchema = Joi.object({
  body: Joi.string().required().escapeHTML(),
  rating: Joi.number().integer().min(1).max(5).required(),
});

export { campgroundSchema, reviewSchema };
