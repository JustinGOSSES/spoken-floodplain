/* eslint-disable no-undef */
/**
 * geoJSON simple
 */

/////////////////////////////////


//// An initial position point for the map set as a global variable. 
//// It might be changed by other JavaScript.
var dataGlobal = [-95.498,29.7604]
var polygons = ""
var isLocationWithinOneFloodplainPolygon = false

// config map
let config = {
    minZoom: 2,
    maxZoom: 18,
  };
  // magnification with which the map will start
  const zoom = 10;
  // co-ordinates 29.7604, -95.498
  const lat = dataGlobal[1]
  const lng = dataGlobal[0] //-95.38;
  
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
      // 'Content-Type': 'application/json',
      // 'Accept': 'application/json'
     }

  })
    .then(function (response) {
      console.log('response message:', response); 
      //var data = response.json()
      //console.log('data early, json :', data);
      // await addFeatureToMap(data) 
      // setTimeout(function(data) {
      //   return addFeatureToMap(data) ;
      // }, 10000);
      return response.json();
    })
    .then(function (data) {
      // use geoJSON
      polygons = data
      console.log('data', data); 
      L.geoJSON(data, {
        onEachFeature: onEachFeature,
      }).addTo(map);
    });

function addFeatureToMap(data){
  console.log('data', data); 
      L.geoJSON(data, {
        onEachFeature: onEachFeature,
      }).addTo(map);
}


function getLocation(x) {
  if (navigator.geolocation) {
    //// This calls the function showPosition with an argument of the position of the device.
    //// We'll assume that the geojson polygons is already loaded.
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
}


function showPosition(position) {
  //// This resets the center of the map based on the location position from the device.
  map.setView([position.coords.latitude, position.coords.longitude], 15)
  //// Creates a turf point from the position location coordinates.
  turfPoints = turf.points([[position.coords.longitude,position.coords.latitude]]);
  //// This calls the text to speech capabilities of the browser and says the location
  let currentLocationSpeak = new SpeechSynthesisUtterance("Your location is ."+Math.round(position.coords.latitude)+" latitude and"+Math.round(position.coords.longitude)+" longitudes"); 
    window.speechSynthesis.speak(currentLocationSpeak);
  //// This updates the position on the HTML page.
  document.getElementById("location").innerHTML = "Latitude: " + position.coords.latitude + "<br>Longitude: " + position.coords.longitude;
  //// Add marker for location point onto map:
  const marker1 = L.marker([position.coords.latitude, position.coords.longitude]).addTo(map);
  //// Call function to see if location in polygons
  searchWithinPolygonsForPoint(polygons,turfPoints)
}

function showError(error) {
  switch(error.code) {
    case error.PERMISSION_DENIED:
      x.innerHTML = "User denied the request for Geolocation."
      break;
    case error.POSITION_UNAVAILABLE:
      x.innerHTML = "Location information is unavailable."
      break;
    case error.TIMEOUT:
      x.innerHTML = "The request to get user location timed out."
      break;
    case error.UNKNOWN_ERROR:
      x.innerHTML = "An unknown error occurred."
      break;
  }
}

////////// TURF CODE

//var turfPoint = turf.point([-95.498,29.7604]);

function searchWithinPolygonsForPoint(Polygons,turfPoints,isLocationWithinOneFloodplainPolygon){
  console.log("turfPoint",turfPoints)
  console.log("Polygons",Polygons)
  var dataGlobal = [-95.498,29.7604]
  var temp_point_in_floodplain = []
  var numberPolygons = Polygons.features.length
  console.log("number of polygons",numberPolygons)
  console.log('Polygons.features 0',Polygons.features[0])
  for (let i = 0; i < numberPolygons; i++) {
    var searchWithin = turf.polygon(Polygons.features[0].geometry.coordinates);
    var ptsWithin = turf.pointsWithinPolygon(turfPoints, searchWithin);
    if(ptsWithin.features.length != 0){
      console.log("location is within this polyon",ptsWithin);
      //// This calls the text to speech capabilities of the browser and says a user is within the floodplain
    }
  }
  if (isLocationWithinOneFloodplainPolygon == true){
    let withinFloodplainSpeak = new SpeechSynthesisUtterance("Your recently measured location is within the floodplain."); 
    window.speechSynthesis.speak(withinFloodplainSpeak);
  }
  else{
    let notWithinFloodplainSpeak = new SpeechSynthesisUtterance("Your recently measured location is outside the floodplain."); 
    window.speechSynthesis.speak(notWithinFloodplainSpeak);
  }
}
