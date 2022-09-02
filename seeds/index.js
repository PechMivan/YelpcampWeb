import mongoose from "mongoose";

import Campground from "../models/campground.js";
import cities from "./cities.js";
import { descriptors, places } from "./seedHelpers.js";

async function main() {
  await mongoose.connect("mongodb://localhost:27017/yelp-camp");
}

main()
  .then(() => console.log("Connected to MongoDB!"))
  .catch((err) => console.log(err));

function sample(array) {
  return array[Math.floor(Math.random() * array.length)];
}

async function seedDB() {
  await Campground.deleteMany({});

  for (let i = 0; i < 300; i++) {
    const city = sample(cities);
    const geometry = { type: "Point", coordinates: [city.longitude, city.latitude] };
    const camp = new Campground({
      geometry: geometry,
      location: `${city.city}, ${city.state}`,
      author: "627c0fcec9d8d2709e772fa9",
      title: `${sample(descriptors)} ${sample(places)}`,
      images: [
        {
          url: "https://res.cloudinary.com/dvg0khbw8/image/upload/v1656554505/Yelpcamp/camp1_hs7lgu.jpg",
          filename: "camp1_hs7lgu.jpg",
        },
        {
          url: "https://res.cloudinary.com/dvg0khbw8/image/upload/v1656554512/Yelpcamp/camp2_myahqi.jpg",
          filename: "Yelpcamp/camp2_myahqi.jpg",
        },
      ],
      price: Math.floor(Math.random() * 250) + 1,
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nihil vero nemo, animi assumenda perferendis nostrum dolorum in maxime nisi? Quibusdam cupiditate quos ullam! Voluptatum, unde ex ad nostrum ea nam.",
    });
    await camp.save();
  }
  let count = await Campground.count("_id");
  console.log(`[${count}] campgrounds created!`);
}

seedDB().then(() => {
  try {
      mongoose.connection.close();
      console.log('Connection closed. Bye!');
  } catch (error) {
    console.log(error);
  }
});
