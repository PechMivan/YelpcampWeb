let map = new maplibregl.Map({
  container: "map",
  style:
    "https://api.maptiler.com/maps/streets/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL",
  center: campground.geometry.coordinates,
  zoom: 9,
});

let marker = new maplibregl.Marker()
  .setLngLat(campground.geometry.coordinates)
  .setPopup(
    new maplibregl.Popup().setHTML(
      `<h3>${campground.title}</h3>
      <p>${campground.location}</p>`
    )
  )
  .addTo(map);
