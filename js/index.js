/* eslint-disable no-undef */
/**
 * geoJSON simple
 */

// config map
let config = {
    minZoom: 2,
    maxZoom: 18,
  };
  // magnification with which the map will start
  const zoom = 10;
  // co-ordinates 29.7604, -95.498
  const lat = 29.80;
  const lng = -95.38;
  
  // calling map
  const map = L.map("map", config).setView([lat, lng], zoom);
  
  // Used to load and display tile layers on the map
  // Most tile servers require attribution, which you can set under `Layer`
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  
  function onEachFeature(feature, layer) {
    layer.bindPopup(feature.properties.ZONE_SUBTY);
  }
  
  // adding geojson by fetch
  // of course you can use jquery, axios etc.
  fetch("data/created_data/FEMA_FIRM_FloodPolygons_forDisplay_fromNFHL_exported2022_09.geojson", {
    headers : { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
     }

  })
    .then(function (response) {
      console.log('Error parsing JSON from response:', response); 
      return response.json();
    })
    .then(function (data) {
      // use geoJSON
      L.geoJSON(data, {
        onEachFeature: onEachFeature,
      }).addTo(map);
    });