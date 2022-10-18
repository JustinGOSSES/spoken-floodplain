/////////////////////////////////

//// Instead of polluting the namespace all variables and methods are in a single class object instance now.
spokenGeoJSON_Harris_global = ""

//class spokenGeoJson(divIdForMapString){
/**
* This class holds all properties and functions necessary to create a spokenGeoJSON instance. 
* - It calls leaflet.js, noSleep.js, the SpeecSynthysis browswer API, and the getLocation browser APIs.
* - This function can be iniated during a window.addEventListener function that starts on page load.
* - Data for the map is added after class object instance initiation.
* - Several functions are designed to be called via HTML buttons that control behavior.
* - - getLocation() can be kicked off by a "start" button and it starts location finding and placing markers on the map as well as the loop that runs constantly.
* - - stopSpeechUtteranceAndLoop() stops the speaking part but the location finding and map edits continue.
* - - changeSpeakingRate() changes how often and when speaking occurs.
* - sIt returns nothing. 
* @param {string} divIdForMapString, This argument is the string value of the divID in the HTML where the leaflet.js map will be placed.
* @returns {undefined} , nothing is returned
*/
class spokenGeoJSON {
  constructor(divIdForMapString) {
    ////////////////  PROPERTIES //////////////////////////
    /* PROPERTIES: leaflet map */
    this.polygons = "";
    this.dataGlobal = [-95.498,29.7604]; //// This is the center of the map when first created in order of [long, lat]
    this.showPositionPoints = ""; //// These become turf points
    this.config = {minZoom: 2,maxZoom: 18,};  // magnification with which the map will start
    this.zoom = 10;
    this.lat = this.dataGlobal[1];
    this.lng = this.dataGlobal[0];
    this.divIDForMap = divIdForMapString;
    this.map = L.map(this.divIDForMap, this.config).setView([this.lat, this.lng], this.zoom);
    // Used to load and display tile layers on the map
    // Most tile servers require attribution, which you can set under `Layer`
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);
    /* PROPERTIES: map state */
    this.locationState = "noLocationKnownYet"; //// outsideFloodplain, floodplain500yr, floodplain100yr, floodway
    this.isLocationWithinOneFloodplainPolygon = false;
    /* PROPERTIES: speaking */
    this.introductionSpeechSaid = false;
    this.sayLocationInLatLong = false;
    this.speechTool = window.speechSynthesis;
    this.withinFloodplainSpeak = "none"; //// This is a placeholder for a speechSynthesis object
    this.notWithinFloodplainSpeak = "none"; //// This is a placeholder for a speechSynthesis object
    this.sayEveryMeasurement = true;
    /* PROPERTIES: timing */
    this.timeIntervalTriggered = false;
    this.interval = "";
    this.showPosition = this.showPosition.bind(this)
  }
    // //////////////// METHODS //////////////////////////
    //  /* METHODS: data load functions*/
    //  /* moved this out as could be different ways to bring in data and best to not be specific */
    /* METHODS: map functions*/
    /**
     * This function sets the style on each feature in a given layer that is already applied to the leaflet map.
     * @param {object} feature, the geojson feature that will be styled
     * @param {object} layer, the layer on the leaflet.js map that will be styled
     * @returns {undefined} , nothing is returned
     */
    onEachFeature(feature, layer) {
        layer.bindPopup(feature.properties.ZONE_SUBTY);
        if("FLOODWAY" == feature.properties.ZONE_SUBTY){
          layer.setStyle({
            weight: 3,
            opacity: 1,
            color: 'blue',
            fillOpacity: 0.22,
            fillColor: 'blue'
          })
        }
        else if(feature.properties.ZONE_SUBTY == "0.2 PCT ANNUAL CHANCE FLOOD HAZARD"){
          layer.setStyle({
            weight: 1,
            opacity: 1,
            color: 'blue',
            fillOpacity: 0.1,
            fillColor: 'blue'
          })
        }
        else{
          layer.setStyle({
            weight: 1,
            opacity: 1,
            color: 'blue',
            fillOpacity: 0.15,
            fillColor: 'blue'
          })
        }
      }
  /**
   * This function sets markers for the current position on the leaflet map.
   * @param {object} position, the lat / long current position that is to be added to the map
   * @returns {undefined} , nothing is returned
   */
  showPosition(position) {
        //// This resets the center of the map based on the location position from the device.
        this.map.setView([position.coords.latitude, position.coords.longitude], 15)
        //// Creates a turf point from the position location coordinates.
        let turfPoints = turf.points([[position.coords.longitude,position.coords.latitude]]);
        //// This calls the text to speech capabilities of the browser and says the location
        if(this.sayLocationInLatLong){
          let currentLocationSpeak = new SpeechSynthesisUtterance("Your location is "+Math.trunc(position.coords.latitude)+" latitude and"+Math.trunc(position.coords.longitude)+" longitudes"); 
          window.speechSynthesis.speak(currentLocationSpeak);
        }
        //// This updates the position on the HTML page.
        document.getElementById("location").innerHTML = "Latitude: " + position.coords.latitude + "<br>Longitude: " + position.coords.longitude;
        //// Add marker for location point onto map:
        const marker1 = L.marker([position.coords.latitude, position.coords.longitude]).addTo(this.map);
        //// Call function to see if location in polygons
        // searchWithinPolygonsForPoint(polygons,turfPoints)
        this.showPositionPoints = turfPoints
      }
  /* METHODS: from buttons*/
  /**
   * This function kicks off a bunch of things including asking for location, starting speech, setting up noSleep, and the loops.
   * @param {object} withinFloodplainSpeak, a speech utterance ready to go for when the maker is within the floodplain.
   * @param {object} notWithinFloodplainSpeak, a speech utterance ready to go for when the maker is NOT within the floodplain.
   * @returns {undefined} , nothing is returned
   */
  getLocation(withinFloodplainSpeak,notWithinFloodplainSpeak) {
    if (navigator.geolocation) {
      //// We'll assume that the geojson polygons is already loaded.
      console.log("got into getLocation function before checking if introductionSpeechSaid == false")
      //// Change button focus state
      var element = document.getElementById("start");
      element.classList.add("selected");
      var elmentOther =  document.getElementById('stop');
      elmentOther.classList.remove('selected');
      while(this.introductionSpeechSaid == false){
        this.speechTool = window.speechSynthesis
        console.log("got into getLocation function and introductionSpeechSaid == false")     
        let introSpeak= new SpeechSynthesisUtterance("Location services activated."); //If you do not want to be asked again, be sure to click the remember this decision checkmark. 
        // console.log("startCheckingLocationEveryInterval() on line above")
        // console.log("timeIntervalTriggered is set to:",this.timeIntervalTriggered)
        this.timeIntervalTriggered = true
        console.log("timeIntervalTriggered is set to:",this.timeIntervalTriggered)
        window.speechSynthesis.speak(introSpeak);
        this.insideLoopFunction()
        this.introductionSpeechSaid = true
      }
        console.log("got into getLocation function and introductionSpeechSaid != false.")
        this.interval = function(){
            return setInterval(function() {
              this.insideLoopFunction();
            }, 10000)
          }
    } else {
      x.innerHTML = "Geolocation is not supported by this browser.";
    }
    var noSleep = "notActivated"
    try {
      noSleep = new NoSleep();
      noSleep.enable(); // keep the screen on!
      //wakeLockEnabled = true;
    }
    catch (error){
      console.log("error with nosleep.js, error=",error)
    }
  }

  /* METHODS: location looping */
  /**
   * TODO --- This function is the inside loop that runs until something changes
   * TODO Explain it more!
   * @returns {undefined} , nothing is returned
   */
  insideLoopFunction(){
    //var position = navigator.geolocation.watchPosition(showPosition);
    var position = navigator.geolocation.getCurrentPosition(this.showPosition);
    console.log("navigator value in insideLoopFunction",this.position)
    console.log('test global variable showPositionPoints',this.showPositionPoints)
    var turfPoints = this.showPositionPoints
    console.log("turfPoint",turfPoints)
    // console.log("Polygons",this.polygons)
    var numberPolygons = this.polygons.features.length
    console.log("number of polygons",numberPolygons)
    console.log('Polygons.features 0',this.polygons.features[0])
    var newLocationState = "outside"
    for (let i = 0; i < numberPolygons-1; i++) {
      try {
        var searchWithin = turf.polygon(polygons.features[i].geometry.coordinates);
        var ptsWithin = turf.pointsWithinPolygon(turfPoints, searchWithin);
        if(ptsWithin.features.length != 0){
          this.newLocationState = "inside"
          console.log("new location is within this polyon",ptsWithin);
          //// This calls the text to speech capabilities of the browser and says a user is within the floodplain
        }
        else{
          //newLocationState = "outside"
          // console.log("new location is within this polyon",ptsWithin);
        }
      }
      catch(err){
        console.log("error in searchWithiPolygonsForPoint function =",err)
      }
    }
    if(newLocationState == this.isLocationWithinOneFloodplainPolygon){
      //// if states are same, do nothing
     console.log("In function checkLocationStateAndUpdate(), newLocationState == isLocationWithinOneFloodplainPolygon")
     console.log("This means no change in location state, which is: ",this.isLocationWithinOneFloodplainPolygon, "floodplain")
     if(this.sayEveryMeasurement){
       if(newLocationState == "outside"){
        let notWithinFloodplainSpeak = new SpeechSynthesisUtterance("Your recently measured location is still outside the floodplain."); 
        console.log("type notWithinFloodplainSpeak",typeof(notWithinFloodplainSpeak))
        this.speechTool.speak(notWithinFloodplainSpeak);
  
         
       }
       else if(newLocationState == "inside"){
        let withinFloodplainSpeak = new SpeechSynthesisUtterance("Your recently measured location is still within the floodplain."); 
         this.speechTool.speak(withinFloodplainSpeak);
       }
       else{
        let withinFloodplainSpeak = new SpeechSynthesisUtterance("Your recently measured location is not expected by the program with a value of",newLocationState); 
         this.speechTool.speak(withinFloodplainSpeak);
       }
     }
   }
   //// if states different
    else{
      
      ///// then say new location state
      if(newLocationState == "inside"){
          let withinFloodplainSpeak = new SpeechSynthesisUtterance("Note, you are within the floodplain."); 
          this.speechTool.speak(withinFloodplainSpeak);
      }
      else{
          console.log("newLocationState ",newLocationState )
          console.log("isLocationWithinOneFloodplainPolygon ",this.isLocationWithinOneFloodplainPolygon )
          let notWithinFloodplainSpeak = new SpeechSynthesisUtterance("You are not in the floodplain."); 
          console.log("type notWithinFloodplainSpeak",typeof(notWithinFloodplainSpeak))
          this.speechTool.speak(notWithinFloodplainSpeak);
      }
      ///// then update new state in variablew location state
    }
    this.isLocationWithinOneFloodplainPolygon = newLocationState
  }

  /* METHODS: speaking changes */
   /**
   * TODO --- This function stops the speech utterance calls and sets this.locationState to "noLocationKnownYet"
   * It also changes the button styles so it is obvious they were pushed.
   * TODO Explain it more!
   * @param {boolean} reStateActivation, Default value is true. 
   * @returns {undefined} , nothing is returned
   */
  stopSpeechUtteranceAndLoop(reStateActivation=true){
    clearInterval(this.interval)
    console.log("used stopSpeechUtteranceAndLoop() function to cleare interval")
    this.timeIntervalTriggered = false
    if(reStateActivation){
      this.introductionSpeechSaid = false
    }
    console.log("used stopSpeechUtteranceAndLoop() function to set timeIntervalTriggered = false and introductionSpeechSaid = false")
    speechSynthesis.cancel()
    console.log("used stopSpeechUtteranceAndLoop() function to call speechSynthesis.cancel()")
    this.locationState = "noLocationKnownYet"
    console.log("used stopSpeechUtteranceAndLoop() function to set locationState = noLocationKnownYet")
    //// Change button focus state
    var element = document.getElementById("stop");
    element.classList.add("selected");
    var elmentOther =  document.getElementById('start');
    elmentOther.classList.remove('selected');
  }
  /**
   * TODO --- This function changes the rate and circumstances of speech utterance calls
   * TODO
   * TODO Explain it more!
   * @param {string} howOfte, A string value of preferred state. Options are ....... TODO.....
   * @returns {undefined} , nothing is returned
   */
  changeSpeakingRate(howOften){ //// 'constantly' or 'boundaries' are expected values
    //// Call function to stop code
    this.stopSpeechUtteranceAndLoop(this.reStateActivation=false)
    //// Change sayEveryMeasurement from true to false if howOften variable is 'boundaries' and inverse other way
    try {
      console.log("sayEveryMeasurement = ",this.sayEveryMeasurement)
      if (this.sayEveryMeasurement == true && howOften == 'boundaries' ){
        this.sayEveryMeasurement = false
        let speakingRateConstantFalse = new SpeechSynthesisUtterance("Now giving information only at floodplain boundaries."); 
         this.speechTool.speak(speakingRateConstantFalse);
         //// Change button focus state
        var element = document.getElementById("boundaries");
        element.classList.add("selected");
        var elmentOther =  document.getElementById('constantly');
        elmentOther.classList.remove('selected');
      }
      else if (this.sayEveryMeasurement == false  && howOften == 'constantly' ){
        this.sayEveryMeasurement = true
        let speakingRateConstant = new SpeechSynthesisUtterance("Now giving information every several seconds."); 
         this.speechTool.speak(speakingRateConstant);
            //// Change button focus state
        var element = document.getElementById("constantly");
        element.classList.add("selected");
        var elmentOther =  document.getElementById('boundaries');
        elmentOther.classList.remove('selected');
      }
      else{
        let speakingRateNoChange = new SpeechSynthesisUtterance("That speaking rate already selected. No change."); 
         this.speechTool.speak(speakingRateNoChange);
      }
  
      // console.log("sayEveryMeasurement after change = ",this.sayEveryMeasurement)
    } catch (e) {
        console.error(e, e.stack);
    }
    //// restart loop
    this.getLocation(this.withinFloodplainSpeak,this.notWithinFloodplainSpeak)
  }
  
  /* METHODS: change configurations */
     /**
   * TODO --- This function shows more useful errors when they occur in a certain place in the class
   * @param {object} error, the error
   * @returns {undefined} , nothing is returned
   */
  showError(error) {
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

}



/**
 * This function starts calling the initial JavaScript functions after the HTML is loaded. 
 * Specifically it calls the fetches function to get the geojson data loaded 
 * and creates an instance of the spokenGeoJSON class and then adds the data to it as 'polygons' property before
 * calling the onEachFeature method of the spokenGeoJSON class that applies that data to the leaflet map intiated
 * when the class instance was first initiated.
 * @returns {undefined} , nothing is returned
 */
window.addEventListener('load', (event) => {
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
      let spokenGeoJSON_Harris = new spokenGeoJSON(divIdForMapString='map')
      spokenGeoJSON_Harris.polygons = data
      console.log('data', data); 
      L.geoJSON(data, {
        onEachFeature: spokenGeoJSON_Harris.onEachFeature,
      }).addTo(spokenGeoJSON_Harris.map);
      console.log('spokenGeoJSON_Harris',spokenGeoJSON_Harris)
      spokenGeoJSON_Harris_global = spokenGeoJSON_Harris
    });
  // let spokenGeoJSON_Harris = new spokenGeoJSON(divIdForMapString='map')
  console.log('The page has fully loaded');
});