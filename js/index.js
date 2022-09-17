/* eslint-disable no-undef */
/**
 * geoJSON simple
 */

/////////////////////////////////

var dataGlobal = [-95.498,29.7604]

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
      dataGlobal = data
      console.log('data', data); 
      L.geoJSON(data, {
        onEachFeature: onEachFeature,
      }).addTo(map);
      searchWithinPolygonsForPoint(data)
    });

function addFeatureToMap(data){
  console.log('data', data); 
      L.geoJSON(data, {
        onEachFeature: onEachFeature,
      }).addTo(map);
}


function getLocation(x) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);

  } else {
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
}


function showPosition(position) {
  map.setView([position.coords.latitude, position.coords.longitude], 15)
  turfPoint = turf.point([position.coords.longitude,position.coords.latitude]);
  let working = new SpeechSynthesisUtterance("Your location is ."+Math.round(position.coords.latitude)+" latitude and"+Math.round(position.coords.longitude)+" longitudes"); 
    window.speechSynthesis.speak(working);
  document.getElementById("location").innerHTML = "Latitude: " + position.coords.latitude + "<br>Longitude: " + position.coords.longitude;
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

var turfPoint = turf.point([-95.498,29.7604]);

function searchWithinPolygonsForPoint(Polygons){
  console.log("turfPoint",turfPoint)
  //turfPoint
  //polygon
  ////
  //var pointsFP = turf.points([[-95.380911,29.815999]]);
  var dataGlobal = [-95.498,29.7604]
  var pointsFP = turf.points([dataGlobal]);

  var temp_point_in_floodplain = []
  var numberPolygons = Polygons.features.length
  console.log("number of polygons",numberPolygons)
  console.log('Polygons.features 0',Polygons.features[0])
  for (let i = 0; i < numberPolygons; i++) {
    //console.log("Polygons.features",Polygons.features[0].geometry.coordinates)
    var searchWithin = turf.polygon(Polygons.features[0].geometry.coordinates);
    // var searchWithin = await turf.multiPolygon(Polygons.features.geometry.coordinates);
    var ptsWithin = turf.pointsWithinPolygon(pointsFP, searchWithin);
    if(ptsWithin.features.length != 0){
      console.log("location is within this polyon",ptsWithin);
    }
    // console.log("ptsWithin",ptsWithin);
  }
  // var searchWithin = turf.multiPolygon(Polygons.features.geometry.coordinates);
  // var ptsWithin = turf.pointsWithinPolygon(pointsFP, searchWithin);
  // console.log("ptsWithin",ptsWithin);
}
