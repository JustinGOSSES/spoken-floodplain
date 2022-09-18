/////////////////////////////////


//// An initial position point for the map set as a global variable. 
//// It might be changed by other JavaScript.
var dataGlobal = [-95.498,29.7604]
var polygons = ""
var isLocationWithinOneFloodplainPolygon = false
var introductionSpeechSaid = false
var timeIntervalTriggered = false
var locationState = "noLocationKnownYet" //// outsideFloodplain, floodplain500yr, floodplain100yr, floodway
var interval = ""
var sayLocationInLatLong = false

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
  //fetch("./data/created_data/FEMA_FIRM_FloodPolygons_forDisplay_fromNFHL_exported2022_09.geojson", {
  fetch("./data/FEMA_FIRM_FloodPolygons.json", {
    
    headers : { 
      // 'Content-Type': 'application/json',
      // 'Accept': 'application/json'
     }

  })
    .then(function (response) {
      console.log('response message:', response); 
      var data = response.json()
      //console.log('data early, json :', data);
      // await addFeatureToMap(data) 
      // setTimeout(function(data) {
      //   return addFeatureToMap(data) ;
      // }, 10000);
      return data;
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
    // $('#trigger').trigger('click')
    //// This calls the function showPosition with an argument of the position of the device.
    //// We'll assume that the geojson polygons is already loaded.
    console.log("got into getLocation function before checking if introductionSpeechSaid == false")
    if(introductionSpeechSaid == false){
      console.log("got into getLocation function and introductionSpeechSaid == false")     
      let introSpeak= new SpeechSynthesisUtterance("Location based services activated."); //If you do not want to be asked again, be sure to click the remember this decision checkmark. 
      window.speechSynthesis.speak(introSpeak);
      introductionSpeechSaid = true
      startCheckingLocationEveryInterval()
      console.log("startCheckingLocationEveryInterval() on line above")
      console.log("timeIntervalTriggered is set to:",timeIntervalTriggered)
      timeIntervalTriggered = true
      console.log("timeIntervalTriggered is set to:",timeIntervalTriggered)
    }
    else{
      console.log("got into getLocation function and introductionSpeechSaid != false.")
      if(timeIntervalTriggered != false){
        navigator.geolocation.getCurrentPosition(showPosition);
      }
      else{
        console.log("got here? shouldn't get here")
      }
    }
  } else {
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
}

function stopSpeechUtteranceAndLoop(){
  clearInterval(interval)
  console.log("used stopSpeechUtteranceAndLoop() function to cleare interval")
  timeIntervalTriggered = false
  introductionSpeechSaid = false
  console.log("used stopSpeechUtteranceAndLoop() function to set timeIntervalTriggered = false and introductionSpeechSaid = false")
  speechSynthesis.cancel()
  console.log("used stopSpeechUtteranceAndLoop() function to call speechSynthesis.cancel()")
  locationState = "noLocationKnownYet"
  console.log("used stopSpeechUtteranceAndLoop() function to set locationState = noLocationKnownYet")
}

function showPosition(position) {
  //// This resets the center of the map based on the location position from the device.
  map.setView([position.coords.latitude, position.coords.longitude], 15)
  //// Creates a turf point from the position location coordinates.
  turfPoints = turf.points([[position.coords.longitude,position.coords.latitude]]);
  //// This calls the text to speech capabilities of the browser and says the location
  if(sayLocationInLatLong){
    let currentLocationSpeak = new SpeechSynthesisUtterance("Your location is "+Math.trunc(position.coords.latitude)+" latitude and"+Math.trunc(position.coords.longitude)+" longitudes"); 
    window.speechSynthesis.speak(currentLocationSpeak);
  }
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
  var newLocationState = "unknown"
  for (let i = 0; i < numberPolygons; i++) {
    var searchWithin = turf.polygon(Polygons.features[0].geometry.coordinates);
    var ptsWithin = turf.pointsWithinPolygon(turfPoints, searchWithin);
    if(ptsWithin.features.length != 0){
      newLocationState = "inside"
      console.log("new location is within this polyon",ptsWithin);
      //// This calls the text to speech capabilities of the browser and says a user is within the floodplain
    }
    else{
      newLocationState = "outside"
      // console.log("new location is within this polyon",ptsWithin);
    }
  }
  checkLocationStateAndUpdate(newLocationState)
  // if (isLocationWithinOneFloodplainPolygon == true){
  //   let withinFloodplainSpeak = new SpeechSynthesisUtterance("Your recently measured location is within the floodplain."); 
  //   window.speechSynthesis.speak(withinFloodplainSpeak);
  // }
  // else{
  //   let notWithinFloodplainSpeak = new SpeechSynthesisUtterance("Your recently measured location is outside the floodplain."); 
  //   window.speechSynthesis.speak(notWithinFloodplainSpeak);
  // }
  //; 
}

function checkLocationStateAndUpdate(newLocationState){
  //// checks if current state and past state are different.
  //console.log("comparison",isLocationWithinOneFloodplainPolygon.localeCompare(newLocationState))
  if(newLocationState == isLocationWithinOneFloodplainPolygon){
     //// if states are same, do nothing
    console.log("In function checkLocationStateAndUpdate(), newLocationState == isLocationWithinOneFloodplainPolygon")
    console.log("This measn no change in location state, which is: ",isLocationWithinOneFloodplainPolygon, "floodplain.")
  }
  //// if states different
  else{
    isLocationWithinOneFloodplainPolygon = newLocationState
    ///// then say new location state
    if(newLocationState == "inside"){
        let withinFloodplainSpeak = new SpeechSynthesisUtterance("Your recently measured location is within the floodplain."); 
        window.speechSynthesis.speak(withinFloodplainSpeak);
    }
    else{
        console.log("newLocationState ",newLocationState )
        console.log("isLocationWithinOneFloodplainPolygon ",isLocationWithinOneFloodplainPolygon )
        let notWithinFloodplainSpeak = new SpeechSynthesisUtterance("Your recently measured location is outside the floodplain."); 
        window.speechSynthesis.speak(notWithinFloodplainSpeak);
    }
    ///// then update new state in variablew location state
    
  }
  return ""
}

function startCheckingLocationEveryInterval(){
  interval = setInterval(function() {getLocation();}, 5000)
}

