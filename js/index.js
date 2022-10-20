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
    this.currentPositionPoints = ""; //// These become turf points
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
    this.introductionSpeechSaid = false; //// Tracks a state of whether introductury text has been said yet.
    this.sayLocationInLatLong = false;
    this.speechTool = window.speechSynthesis;
    this.withinFloodplainSpeak = "none"; //// This is a placeholder for a speechSynthesis object
    this.notWithinFloodplainSpeak = "none"; //// This is a placeholder for a speechSynthesis object
    this.sayEveryMeasurement = false;
    /* PROPERTIES: timing */
    this.timeIntervalTriggered = false;  
    this.interval = "";
    this.showPosition = this.showPosition.bind(this)
    this.adjustPosition = this.adjustPosition.bind(this)
    this.triggerNavigatorGeoLocation= this.triggerNavigatorGeoLocation.bind(this)
    this.insideLoopFunction = this.insideLoopFunction.bind(this)
    // this.setInterval = setInterval.bind(this)
    this.counter = 0
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
  adjustPosition(position) {
        // //// This resets the center of the map based on the location position from the device.
        // this.map.setView([position.coords.latitude, position.coords.longitude], 15)
        // //// Creates a turf point from the position location coordinates.

        // let turfPoints = turf.points([[position.coords.longitude + 0.01*this.counter,position.coords.latitude ]]);
        // this.currentPositionPoints = turfPoints
        // this.lat = position.coords.latitude 
        // this.lng = position.coords.longitude + 0.01*this.counter
        let turfPoints = turf.points([[position.coords.longitude,position.coords.latitude ]]);
        this.currentPositionPoints = turfPoints
        this.lat = position.coords.latitude 
        this.lng = position.coords.longitude 

        //// This calls the text to speech capabilities of the browser and says the location
        // if(this.sayLocationInLatLong){
        //   let currentLocationSpeak = new SpeechSynthesisUtterance("Your location is "+Math.trunc(position.coords.latitude)+" latitude and"+Math.trunc(position.coords.longitude)+" longitudes"); 
        //   window.speechSynthesis.speak(currentLocationSpeak);
        // }
        //// This updates the position on the HTML page.
        document.getElementById("location").innerHTML = "Latitude: " + this.lat + "<br>Longitude: " + this.lng;
        //// Add marker for location point onto map:
        this.map.setView([this.lat, this.lng], 15)
        const marker1 = L.marker([this.lat, this.lng]).addTo(this.map);
        //////////
        console.log('test global variable currentPositionPoints',this.currentPositionPoints)
        turfPoints = this.currentPositionPoints
        console.log("turfPoint",turfPoints)
        // console.log("Polygons",this.polygons)
        var numberPolygons = this.polygons.features.length
        console.log("number of polygons",numberPolygons)
        console.log('Polygons.features 0',this.polygons.features[0])
        //// Checks each polygon to see if the point is within one of them. 
        //// Changes var newLocationState to "inside" if inside at least one.
        //// Call function to see if location in polygons
        // searchWithinPolygonsForPoint(polygons,turfPoints)
        var newLocationState = "outside"
        for (let i = 0; i < numberPolygons-1; i++) {
          try {
            var searchWithin = turf.polygon(this.polygons.features[i].geometry.coordinates);
            var ptsWithin = turf.pointsWithinPolygon(turfPoints, searchWithin);
            if(ptsWithin.features.length != 0){
              newLocationState = "inside"
              console.log("new location is within this polyon",ptsWithin);
            }
          }
          catch(err){
            console.log("error in insideLoopFunction() function, which is:",err)
          }
        }
            //// If new location is same as old location state, "outside" or "inside" then this evaluates as true.
    if(newLocationState == this.isLocationWithinOneFloodplainPolygon){
      //// if states are same, do nothing
     console.log("In insideLoop function, var newLocationState == this.isLocationWithinOneFloodplainPolygon")
     console.log("This means no change in location state, which was last: ",this.isLocationWithinOneFloodplainPolygon, "floodplain. And current is ",newLocationState)
     //// This part only triggers if this.sayEveryMeasurement == True.
     if(this.sayEveryMeasurement){
       if(newLocationState == "outside"){
        let notWithinFloodplainSpeak = new SpeechSynthesisUtterance("Your recently measured location is still outside the floodplain."); 
        // console.log("type notWithinFloodplainSpeak",typeof(notWithinFloodplainSpeak))
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
          let withinFloodplainSpeak = new SpeechSynthesisUtterance("Note, you are now within the floodplain."); 
          this.speechTool.speak(withinFloodplainSpeak);
      }
      else{
          console.log("newLocationState ",newLocationState )
          console.log("isLocationWithinOneFloodplainPolygon ",this.isLocationWithinOneFloodplainPolygon )
          let notWithinFloodplainSpeak = new SpeechSynthesisUtterance("Note, you are not in the floodplain."); 
          // console.log("type notWithinFloodplainSpeak",typeof(notWithinFloodplainSpeak))
          this.speechTool.speak(notWithinFloodplainSpeak);
      }
      ///// then update new state in variablew location state
    }
    this.isLocationWithinOneFloodplainPolygon = newLocationState
  }
    /**
   * This function sets markers for the current position on the leaflet map.
   * @param {object} position, the lat / long current position that is to be added to the map
   * @returns {undefined} , nothing is returned
   */
    showPosition() {
      //// This resets the center of the map based on the location position from the device.
      this.currentPositionPoints
      // this.map.setView([position.coords.latitude, position.coords.longitude], 15)
      // this.map.setView([this.currentPositionPointsp[0], this.currentPositionPoints[1]], 15)
      //// Creates a turf point from the position location coordinates.
      // let turfPoints = turf.points([[position.coords.longitude,position.coords.latitude]]);
      //// This calls the text to speech capabilities of the browser and says the location
      if(this.sayLocationInLatLong){
        // let currentLocationSpeak = new SpeechSynthesisUtterance("Your location is "+Math.trunc(position.coords.latitude)+" latitude and"+Math.trunc(position.coords.longitude)+" longitudes"); 
        let currentLocationSpeak = new SpeechSynthesisUtterance("Your location is "+Math.trunc(this.currentPositionPoints[0])+" latitude and"+Math.trunc(this.currentPositionPoints[1], 15)+" longitudes"); 
        window.speechSynthesis.speak(currentLocationSpeak);
      }
      //// This updates the position on the HTML page.
      // document.getElementById("location").innerHTML = "Latitude: " + this.currentPositionPoints[0] + "<br>Longitude: " + this.currentPositionPoints[1], 15;
      //// Add marker for location point onto map:
      // const marker1 = L.marker([this.currentPositionPoints[0], this.currentPositionPoints[1]]).addTo(this.map);
      //// Call function to see if location in polygons
      // searchWithinPolygonsForPoint(polygons,turfPoints)
      // this.currentPositionPoints = turfPoints
    }
  triggerNavigatorGeoLocation(moveNorth=true,moveEast=false){
    console.log('triggered function triggerNavigatorGeoLocation() and argument moveNorth = ', moveNorth," and argument moveEast =",moveEast)
    var fakeLocation = true
    if (fakeLocation){
      var fakePosition = {
        "coords": {
          "longitude": this.dataGlobal[0],
          "latitude":this.dataGlobal[1]
        }  
      }
      if(moveNorth){
        this.counter += 1
        fakePosition["coords"]["latitude"] += 0.01*this.counter
      }
      if(moveEast){
        this.counter += 1
        fakePosition["coords"]["longitude"] += 0.01*this.counter
      }
      this.adjustPosition(fakePosition)
    }
    else{
      var iteration_number = navigator.geolocation.watchPosition(this.adjustPosition);
    }
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
      
      // var iteration_number = navigator.geolocation.watchPosition(this.adjustPosition);
      //// We'll assume that the geojson polygons is already loaded.
      // console.log("got into getLocation function before checking if introductionSpeechSaid == false")
      //// Change button focus state
      var element = document.getElementById("start");
      element.classList.add("selected");
      var elmentOther =  document.getElementById('stop');
      elmentOther.classList.remove('selected');
      //// A loop that persists until the introduction spoken words are said      
      while(this.introductionSpeechSaid == false){
        this.speechTool = window.speechSynthesis
        console.log("got into getLocation function and introductionSpeechSaid == false")     
        let introSpeak= new SpeechSynthesisUtterance("Location services activated."); //If you do not want to be asked again, be sure to click the remember this decision checkmark. 
        console.log("timeIntervalTriggered is set to:",this.timeIntervalTriggered, "A")
        window.speechSynthesis.speak(introSpeak);
        this.insideLoopFunction()
        this.introductionSpeechSaid = true
        this.triggerNavigatorGeoLocation()
      }
        console.log("got into getLocation function and introductionSpeechSaid != false.")
        //// These start the insideLoopFunction() with an interval of 10 seconds
        this.triggerNavigatorGeoLocation()
        this.interval = setInterval(
          this.insideLoopFunction.bind(this),1000
          )
    } else {
      x.innerHTML = "Geolocation is not supported by this browser.";
    }
    //// Uses the noSleep script brought in via script tag in html document to stop browser from falling asleep 
    //// when you do not interact with the screen.
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
    //// navigator.geolocation.getCurrentPosition() gets the current position when this is called and then sends the position
    //// to the function that is the argument this.showPosition(). 
    //// getCurrentPosition
    // var iteration_number = navigator.geolocation.watchPosition(this.adjustPosition);
    // console.log("navigator value in insideLoopFunction",iteration_number," which should be the same as...")
    console.log('Within insideLoopFunction() the test global variable currentPositionPoints',this.currentPositionPoints)
    var turfPoints = this.currentPositionPoints
    console.log("turfPoint",turfPoints)
    // console.log("Polygons",this.polygons)
    var numberPolygons = this.polygons.features.length
    console.log("number of polygons",numberPolygons)
    console.log('Polygons.features 0',this.polygons.features[0])
    //// Checks each polygon to see if the point is within one of them. 
    //// Changes var newLocationState to "inside" if inside at least one.
    // var newLocationState = "outside"
    // for (let i = 0; i < numberPolygons-1; i++) {
    //   try {
    //     var searchWithin = turf.polygon(this.polygons.features[i].geometry.coordinates);
    //     var ptsWithin = turf.pointsWithinPolygon(turfPoints, searchWithin);
    //     if(ptsWithin.features.length != 0){
    //       newLocationState = "inside"
    //       console.log("new location is within this polyon",ptsWithin);
    //     }
    //   }
    //   catch(err){
    //     console.log("error in insideLoopFunction() function, which is:",err)
    //   }
    // }
    ////////////////  REWRITE THIS FUNCTION TO DO THIS !!!!!!!!!!
    //// This function should only be triggered X seconds after the last spoken message. 
    //// It should confirm if last measured location is the same or different than last spoken location. 
    //// Then depending on if same or differnet and location state, say a message.
    //// And finally reset count on when last message said.
    ///////////////
    //// If new location is same as old location state, "outside" or "inside" then this evaluates as true.
    if(newLocationState == this.isLocationWithinOneFloodplainPolygon){
      //// if states are same, do nothing
     console.log("In insideLoop function, var newLocationState == this.isLocationWithinOneFloodplainPolygon")
     console.log("This means no change in location state, which was last: ",this.isLocationWithinOneFloodplainPolygon, "floodplain. And current is ",newLocationState)
     //// This part only triggers if this.sayEveryMeasurement == True.
     if(this.sayEveryMeasurement){
       if(newLocationState == "outside"){
        let notWithinFloodplainSpeak = new SpeechSynthesisUtterance("Your recently measured location is still outside the floodplain."); 
        // console.log("type notWithinFloodplainSpeak",typeof(notWithinFloodplainSpeak))
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
          let withinFloodplainSpeak = new SpeechSynthesisUtterance("Note, you are now within the floodplain."); 
          this.speechTool.speak(withinFloodplainSpeak);
      }
      else{
          console.log("newLocationState ",newLocationState )
          console.log("isLocationWithinOneFloodplainPolygon ",this.isLocationWithinOneFloodplainPolygon )
          let notWithinFloodplainSpeak = new SpeechSynthesisUtterance("Note, you are not in the floodplain."); 
          // console.log("type notWithinFloodplainSpeak",typeof(notWithinFloodplainSpeak))
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