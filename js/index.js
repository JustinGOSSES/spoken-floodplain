/////////////////////////////////

//// Instead of polluting the namespace all variables and methods are in a single class object instance now.
spokenGeoJSON_Harris_global = ""

//class spokenGeoJson(divIdForMapString){
/**
* This class holds all properties and functions necessary to create a spokenGeoJSON instance. 
* A spokenGeoJSON class instance creates a leaflet.js map which is populated with data from a geojson and then after a button click
* watches the device's location and gives audible statements regarding the current Location being inside of outside
* of the polygons that make up the geojson.
* #### This class function has the following behaviors:
* - It calls leaflet.js for a map. 
* - NoSleep.js to stop the page from going to sleep when the user is not touching the screen.
* - The browser native SpeechSynthysis API is used to generate speech.
* - The device's current location is found using the browser's native getLocation browser API.
* - Data for the map is added after class object instance initiation. This is currently being done by a function iniated during a window.addEventListener function that starts on page load.
* - The class methods below are approximately but not exactly in the order they are called when in use.
* 
* #### Several functions are designed to be called via HTML buttons that control behavior.
* - getLocation() can be kicked off by a "start" button and it starts location finding and placing markers on the map as well as the loop that runs constantly.
* - stopSpeechUtteranceAndLoop() stops the speaking part but the location finding and map edits continue.
* - changeSpeakingRate() changes how often and when speaking occurs.
* 
* To fake movement while testing the application, the   triggerNavigatorGeoLocation(moveDirection=false,fakeLocation=false,moveAmountInDecimals=0.1) function can be used see defintion below.
* @param {string} divIdForMapString, This argument is the string value of the divID in the HTML where the leaflet.js map will be placed.
* 
* #### Properties:
* Currently, all properties of the class object are public and can be populated by simple assignment. 
* Many of the them are changed by internal methods of the spokenGeoJSON class.
* 
* These are properties of the spokenGeoJSON class function. 
      * @property {string} divIDForMap, This property is the divID of a div on the html page you want the leaflet.js map to appear. It accepts the one argument used to initiated the class, which is the string of the Div element where the map will appear.
      * @property {object} polygons, This property holds data from geojson that is put into the leaflet.js map. At class instance creation, it only has an empty string. An outside function must populate it.
      * @property {array} mapCenterAtStart, This property is the center of the map when first created in order of [long, lat]. Default is [-95.498,29.7604]
      * @property {object} currentPositionPoints, This property is an object in the format of turf.js points that represents the lat/long of the current position of the device.
      * @property {object} mapConfig, This property is min and max magnification of the map. Default value is [-95.498,29.7604]
      * @property {integer} zoom, This property is the initial zoom level of the map
      * @property {float} lat, This property is a float representing a latitude value. It is initially populated with the map center, but once location tracking is started will reflect the most recent location of the device.
      * @property {float} lng, This property is a float representing a longitude value. It is initially populated with the map center, but once location tracking is started will reflect the most recent location of the device.
      * @property {object} map, The leaflet map object that is created by the following code `L.map(this.divIDForMap, this.mapConfig).setView([this.lat, this.lng], this.zoom);`. For this to work, leaflet.js needs to be loaded via a script tag elment already.
      * @property {object} tilelayer, The tiles for the map background from openstreet map. This can be changed on the fly after class instance creation.
      * @property {string} lastSpokenState, A string representing the last location state that triggered speech.
      * @property {string} lastMeasuredLocationState, A string representation of the latest measured location state. This means lat/long location converted into a location state by comparing the location to polygons in the geojson.
      * @property {object} lastSpokenStateAtTime, A unix date time object created by `new Date()` code. This is updated on class instance creation and whenever a location state has been spoken. This time is compared to later times to determine if enough time has passed to speak again when location state is spoken at some interval as opposed to only when a new location state is detected.
      * @property {object} this.counter, This is a simple counter used when creating a fake location in the triggerNavigatorGeoLocation function.
      * @property {boolean} introductionSpeechSaid, A true or false boolean value for whether or not the introductury text has been said yet. This starts off as false and converts to true once the introductury text has been said. It should be converted back to false if speaking and/or location has been stopped due to button bush and then restarted via a different button push.
      * @property {boolean} sayLocationInLatLong , Determines whether lat long is said or not. Default is to not say it where has a value of false.
      * @property {object} speechTool, This is the result of the code `window.speechSynthesis` and creates a speech synthesis object available for use by any function in the class, so it doesn't have to recreated each time. Speech synthesis is a native browser capability.
      * @property {object} withinFloodplainSpeak , This is a placeholder for a speechSynthesis object
      * @property {object} notWithinFloodplainSpeak, This is a placeholder for a speechSynthesis object
      * @property {boolean} sayEveryMeasurement, If false, it only speaks when there is a location state change. If true, you get speach every X unit of time as defined by the property speakHowOftenIfNotEveryInSeconds.
      * @property {integer} speakHowOftenIfNotEveryInSeconds, An integer of how many seconds to wait from when a location state is spoken until you say the location state again. This only applies if sayEveryMeasurement is true. Otherwise, the object instance will only speak when a location state has changed. For example, outside a floodplain polygon vs. inside the floodplain polygon.
      * @property {boolean} speechStoppedDueToButtonClick, A true or false for whether a button has been pushed to stop speaking. True = no speaking. false = speak when conditions require it based on other configuration.
      * @property {object} interval , This property holds an object created by calling the native setInterval function that calls the insideLoop function every X time interval. The time interval is set by property speakHowOftenIfNotEveryInSeconds.
      * @public
      * 
* @returns {undefined} , nothing is returned
*/
class spokenGeoJSON {
  constructor(divIdForMapString) {
    ////////////////  PROPERTIES //////////////////////////
    /* PROPERTIES: leaflet map */
    this.divIDForMap = divIdForMapString;  //// The divID of a div on the html page you want the leaflet.js map to appear
    this.polygons = "";  //// Data from geojson is put into this variable.
    this.mapCenterAtStart= [-95.498,29.7604]; 
    this.currentPositionPoints = {}; 
    this.mapConfig = {minZoom: 2,maxZoom: 18,};  //// 
    this.zoom = 10; //// magnification with which the map will start
    this.lat = this.mapCenterAtStart[1];
    this.lng = this.mapCenterAtStart[0];
    this.map = L.map(this.divIDForMap, this.mapConfig).setView([this.lat, this.lng], this.zoom);
    // Used to load and display tile layers on the map
    // Most tile servers require attribution, which you can set under `Layer`
    this.tilelayer = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);
    /* PROPERTIES: location state */
    this.lastSpokenState = "noLocationKnownYet"; //// outside, inside ///floodplain500yr, floodplain100yr, floodway
    this.lastMeasuredLocationState = "noLocationKnownYet"; //// values are "outside", "inside"
    this.lastSpokenStateAtTime = new Date();
    this.counter = 0
    /* PROPERTIES: speaking */
    this.introductionSpeechSaid = false; //// Tracks a state of whether introductury text has been said yet.
    this.sayLocationInLatLong = false;
    this.speechTool = window.speechSynthesis;
    this.withinFloodplainSpeak = "none"; //// This is a placeholder for a speechSynthesis object
    this.notWithinFloodplainSpeak = "none"; //// This is a placeholder for a speechSynthesis object
    this.sayEveryMeasurement = true; //// If false, it only speaks when there is a location state change
    this.speakHowOftenIfNotEveryInSeconds = 10;
    this.speechStoppedDueToButtonClick = false;
    /* PROPERTIES: timing */
    this.interval = "";
    this.adjustPosition = this.adjustPosition.bind(this)
    this.triggerNavigatorGeoLocation= this.triggerNavigatorGeoLocation.bind(this)
    this.insideLoopFunction = this.insideLoopFunction.bind(this)    
  }
  ////////////////// METHODS //////////////////////////
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
  /* METHODS: from buttons*/
  /**
   * This function kicks off a bunch of things including asking for location, starting speech, setting up noSleep, and the loops.
   * @param {object} withinFloodplainSpeak, a speech utterance ready to go for when the maker is within the floodplain.
   * @param {object} notWithinFloodplainSpeak, a speech utterance ready to go for when the maker is NOT within the floodplain.
   * @returns {undefined} , nothing is returned
   */
  getLocation(withinFloodplainSpeak,notWithinFloodplainSpeak) {
    if (navigator.geolocation) {
      var element = document.getElementById("start");
      element.classList.add("selected");
      var elmentOther =  document.getElementById('stop');
      elmentOther.classList.remove('selected');
      this.speechStoppedDueToButtonClick = false;
      //// A loop that persists until the introduction spoken words are said      
      while(this.introductionSpeechSaid == false){
        this.speechTool = window.speechSynthesis
        console.log("got into getLocation function and introductionSpeechSaid == false")     
        let introSpeak= new SpeechSynthesisUtterance("Location services activated."); //If you do not want to be asked again, be sure to click the remember this decision checkmark. 
        window.speechSynthesis.speak(introSpeak);
        ///// Not sure if I should have the line below?
        this.lastSpokenState = "introduction" 
        this.triggerNavigatorGeoLocation()
        // this.insideLoopFunction()
        this.introductionSpeechSaid = true
      }
        console.log("got into getLocation function and introductionSpeechSaid != false.")
        //// These start the insideLoopFunction() with an interval of 10 seconds
        // this.triggerNavigatorGeoLocation()
        this.interval = setInterval(
          this.insideLoopFunction.bind(this),this.speakHowOftenIfNotEveryInSeconds*1000 //// miliseconds, so 10000 milisecondss = 10 seconds *1000
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
  /**
   * This function triggers the adjustPosition(position) function with a position. The position argument is either one from the navigator browswer API or can be fake. 
   * This function creates the fake location based on the three optional arguments of moveDirection, fakeLocation, and moveAmountInDecimals to create a position.
   * 
   * EXAMPLE: If you wanted to test out moving from the current location without actually moving the device, 
   * you would call in the browswer's console: spokenGeoJSON_Harris_global.triggerNavigatorGeoLocation(move="west",fakeLocation=false,moveAmountInDecimals=0.001)
   * 
   * @param {string} moveDirection, Default value is false, whic triggers no movement. Other values possible are "north","south","west", and "east".
   * @param {string} fakeLocation, Whether the starting location should be the current location measured by navigator.getLocation or this.mapCenterAtStart property used on page start.
   * @param {object} moveAmountInDecimals, Default value is 0.1. Any float value like 0.001 or 1.0 will work.
   * @returns {undefined} , nothing is returned. However, the adjustPosition(position) function is triggered.
   */
  triggerNavigatorGeoLocation(moveDirection=false,fakeLocation=false,moveAmountInDecimals=0.1){
      if(moveDirection==false && fakeLocation==false){
        navigator.geolocation.watchPosition(this.adjustPosition);
      }
      var fakePosition = {
        "coords": {
          "longitude": this.mapCenterAtStart[0],
          "latitude":this.mapCenterAtStart[1]
        }  
      }
      if (fakeLocation != false){
        fakePosition = {
          "coords": {
            "longitude": this.mapCenterAtStart[0],
            "latitude":this.mapCenterAtStart[1]
          }  
        }
      }
      if (fakeLocation == false){
        fakePosition.coords.longitude = this.lng;
        fakePosition.coords.latitude = this.lat;
      }
      if(moveDirection=="north"){
        this.counter += 1
        fakePosition["coords"]["latitude"] += moveAmountInDecimals*this.counter
      }
      if(moveDirection=="east"){
        this.counter += 1
        fakePosition["coords"]["longitude"] += moveAmountInDecimals*this.counter
      }
      if(moveDirection=="south"){
        this.counter += 1
        fakePosition["coords"]["latitude"] -= moveAmountInDecimals*this.counter
      }
      if(moveDirection=="west"){
        this.counter += 1
        fakePosition["coords"]["longitude"] -= moveAmountInDecimals*this.counter
      }
      this.adjustPosition(fakePosition)
    }
  /* METHODS: location looping */
  /**
   * This function is the inside loop that runs until something changes. All it does is call the decideWhatToSpeak() function
   * at some interval set via this.speakHowOftenIfNotEveryInSeconds property.
   * @returns {undefined} , nothing is returned
   */
  insideLoopFunction(){
    this.decideWhatToSpeak()
  }
  /**
   * This function sets markers for the current position on the leaflet map and sees if the current position is inside the polygons of the geojson.
   * @param {object} position, the lat / long current position that is to be added to the map
   * @returns {undefined} , nothing is returned
   */
  adjustPosition(position) {
        let turfPoints = turf.points([[position.coords.longitude,position.coords.latitude ]]);
        //// Sets properties with this new location
        this.currentPositionPoints = turfPoints
        this.lat = position.coords.latitude 
        this.lng = position.coords.longitude 
        //// This updates the position on the HTML page.
        document.getElementById("location").innerHTML = "Latitude: " + this.lat + "<br>Longitude: " + this.lng;
        //// Add marker for location point onto map:
        this.map.setView([this.lat, this.lng], 15)
        const marker1 = L.marker([this.lat, this.lng]).addTo(this.map);
        //////////
      this.checksIfLocationStateShouldChangeBasedOnNewLocation()
  }
  /**
  * This function checks if the location state should change based on the last measured location state 
  * the the most recently measured location state.
  * 
  * It updates the location state if it determines it is necessary by comparing current location to last known location
  *  or this.lastMeasuredLocationState then calls the decideWhatToSpeak() function, which figures out if speaking is appropriate at this time.
  *
  * @returns {undefined} , nothing is returned. However, the adjustPosition(position) function is triggered.
  */
  checksIfLocationStateShouldChangeBasedOnNewLocation(){
    console.log('test global variable currentPositionPoints',this.currentPositionPoints)
        var turfPoints = this.currentPositionPoints
        console.log("turfPoint",turfPoints)
        // console.log("Polygons",this.polygons)
        var numberPolygons = this.polygons.features.length
        console.log("number of polygons",numberPolygons)
        //// Checks each polygon to see if the point is within one of them. 
        //// Changes var this.lastMeasuredLocationState  to "inside" if inside at least one.
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
          this.lastMeasuredLocationState = newLocationState
        }
    this.decideWhatToSpeak()
  }
  /**
  * This function grabs several properties from the class object instance and uses them to decide what should be spoken. 
  * It then calls the function speakAndUpdate(synthesizedSpeechUtterance,locationState) 
  * which says the generated speach utterances, updates this.lastSpokenState and this.lastSpokenStateAtTime 
  * Properties that it calls upon to decide what to speak include:
  * - this.speechStoppedDueToButtonClick 
  * - this.lastMeasuredLocationState
  * - this.lastSpokenState
  * - this.sayEveryMeasurement 
  * - this.checkIfEnoughTimeHasGoneToSpeakAgain
  * @returns {undefined} , nothing is returned. However, the speakAndUpdate() function is called
  */
  decideWhatToSpeak(){ 
    if(this.speechStoppedDueToButtonClick == false){
      //// If new location is same as old location state, "outside" or "inside" then this evaluates as true.
      if(this.lastMeasuredLocationState == this.lastSpokenState){
        if(this.sayEveryMeasurement == true){
          console.log("In insideLoop function, var newLocationState == this.lastSpokenState")
          console.log("This means no change in location state, which was last: ",this.lastSpokenState, "floodplain. And current is ",this.lastMeasuredLocationState)
          //// This part only triggers if this.sayEveryMeasurement == True.
          var enoughTimeHasPassedToSpeak = this.checkIfEnoughTimeHasGoneToSpeakAgain(this.lastSpokenStateAtTime)
          if(enoughTimeHasPassedToSpeak){
            if(this.lastMeasuredLocationState == "outside"){
              let notWithinFloodplainSpeak = new SpeechSynthesisUtterance("Your recently measured location is still outside the floodplain."); 
              this.speakAndUpdate(notWithinFloodplainSpeak,"outside")
            }
            else if(this.lastMeasuredLocationState == "inside"){
              let withinFloodplainSpeak = new SpeechSynthesisUtterance("Your recently measured location is still within the floodplain."); 
              this.speakAndUpdate(withinFloodplainSpeak,"inside")
            }
            else{
              let unexpectedStateSpeak = new SpeechSynthesisUtterance("Your recently measured location is not expected by the program with a value of",this.lastMeasuredLocationState); 
              this.speakAndUpdate(unexpectedStateSpeak,"inside")

            }
          }
        }
      }
      //// if states different
      else{
        ///// then say new location state
        if(this.lastMeasuredLocationState == "inside"){
            let withinFloodplainSpeak = new SpeechSynthesisUtterance("Note, you are now within the floodplain."); 
            this.speakAndUpdate(withinFloodplainSpeak ,"inside")
        }
        else if(this.lastMeasuredLocationState == "outside"){
            // console.log("this.lastSpokenState ",this.lastSpokenState )
            // console.log("lastMeasuredLocationState ",this.lastMeasuredLocationState )
            let notWithinFloodplainSpeak = new SpeechSynthesisUtterance("Note, you are not in the floodplain."); 
            this.speakAndUpdate(notWithinFloodplainSpeak ,"outside")
        }
        else{
            // console.log("this.lastSpokenState ",this.lastSpokenState )
            // console.log("lastMeasuredLocationState ",this.lastMeasuredLocationState )
            let notWithinFloodplainSpeak = new SpeechSynthesisUtterance("Note, your location is,",this.lastMeasuredLocationState); 
            this.speakAndUpdate(notWithinFloodplainSpeak ,notWithinFloodplainSpeak)
        }
      }
    }
  }
  /**
   * This function checks to see if enough time has gone by to speak again if there is a limit on how often to speak.
   * @param {object} lastSpokenStateAtTime, This should be the property of 'this.lastSpokenStateAtTime'
   * @returns {boolean} , Returns a boolean value of true or false. True if enough time has passed to speak.
   */
     checkIfEnoughTimeHasGoneToSpeakAgain(lastSpokenStateAtTime){
      var currentDateTime = new Date()
      var seconds = (currentDateTime.getTime() - lastSpokenStateAtTime.getTime()) / 1000;
       if(this.speakHowOftenIfNotEveryInSeconds < seconds){
        return true
       }
       else{
        return false
       }
    }
  /**
  * This function does three things via a single function so these lines don't have to be rewritten 
  * a bunch of times in decideWhatToSpeak() function.
  * It takes in an synthesizedSpeechUtterance object that it calls to speak
  * It takes in locationState argument that it makes the new value of this.lastSpokenState
  * It finds a new date and updates the value of this.lastSpokenStateAtTime with it.
  *
  * @param {object} synthesizedSpeechUtterance, A synthesizedSpeechUtterance object created in decideWhatToSpeak() function
  * @param {string} locationState, A locationState string created in decideWhatToSpeak() function that represents 
  * the location state value of the last measured position. This might be "outside" or "inside" for example.
  * @returns {undefined} , nothing is returned. However, the adjustPosition(position) function is triggered.
  */
  speakAndUpdate(synthesizedSpeechUtterance,locationState){
    this.speechTool.speak(synthesizedSpeechUtterance);
    this.lastSpokenState = locationState
    this.lastSpokenStateAtTime = new Date()
  }
  /* METHODS: speaking changes */
   /**
   * This function stops the speech utterance calls and sets this.locationState to "noLocationKnownYet"
   * It also changes the button styles so it is obvious they were pushed.
   * 
   * These changes are all reverse if the start buton is pressed again and getLocation function is called.
   * @returns {undefined} , nothing is returned
   */
  stopSpeechUtteranceAndLoop(){
    window.clearInterval(this.interval)
    this.speechStoppedDueToButtonClick = true
    console.log("used stopSpeechUtteranceAndLoop() function to cleare interval")
    window.speechSynthesis.cancel()
    console.log("used stopSpeechUtteranceAndLoop() function to call speechSynthesis.cancel()")
    this.lastMeasuredLocationState = "noLocationKnownYet"
    this.lastSpokenState = "noLocationKnownYet"
    console.log("used stopSpeechUtteranceAndLoop() function to set lastMeasuredLocationState to ","noLocationKnownYet")
    //// Change button focus state
    var element = document.getElementById("stop");
    element.classList.add("selected");
    var elmentOther =  document.getElementById('start');
    elmentOther.classList.remove('selected');
  }
  /**
   * This function changes how often words are spoken are the introductury text. 
   * If the howOften argument is "boundaries", then it only tells the user when they have passed from "outside" to "inside" or the inverse.
   * If the howOften argument is set to "constantly", the speaker will also here a message that they are "still in ___" at some interval set by other configuration properties.
   * This function is probably called as a result of a button push in the user interface. 
   * @param {string} howOften, A string value of preferred state. Options are "boundaries" and "constantly".
   * @param {string} newtimeInterval, This updates the property this.speakHowOftenIfNotEveryInSeconds that is used to determine how often to give location state updates when there is no change.
   * @returns {undefined} , nothing is returned
   */
  changeSpeakingRate(howOften,newtimeInterval=10){ //// 'constantly' or 'boundaries' are expected values for howOften
    //// Change sayEveryMeasurement from true to false if howOften variable is 'boundaries' and inverse other way
    console.log("IN function changeSpeakingRate: howOften = ",howOften," and newtimeInterval =",newtimeInterval)
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
        this.speakHowOftenIfNotEveryInSeconds = newtimeInterval
        let speakingRateConstant = new SpeechSynthesisUtterance("Now giving information every several seconds."); 
         this.speechTool.speak(speakingRateConstant);
            //// Change button focus state
        var element = document.getElementById("constantly");
        element.classList.add("selected");
        var elmentOther =  document.getElementById('boundaries');
        elmentOther.classList.remove('selected');
      }
      else if (howOften == 'constantly' && parseFloat(newtimeInterval) != parseFloat(this.speakHowOftenIfNotEveryInSeconds)){
        this.sayEveryMeasurement = true
        this.speakHowOftenIfNotEveryInSeconds = newtimeInterval
        let speakingRateConstant = new SpeechSynthesisUtterance("Now giving information every "+newtimeInterval+" seconds or whenever a floodplain boundary is crossed."); 
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
}


 /**
   * Merely toggles show or hide on the dropdown list of buttons used to select rate at which "no change" messages are spoken.
   * @returns {undefined} , nothing is returned
   */
function showOrHideItemsInTimingList() {
  document.getElementById("myDropdown").classList.toggle("show");
}

 /**
   * // Close the dropdown of class .dropbtn if the user clicks outside of it
   * @returns {undefined} , nothing is returned
   */

window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}


/**
 * This function calls the javascript built-in fetch function to get the geojson data loaded 
 * and creates an instance of the spokenGeoJSON class and then adds the data to it as 'polygons' property before
 * calling the onEachFeature method of the spokenGeoJSON class that applies that data to the leaflet map intiated
 * when the class instance was first initiated.
 * @param {string} urlToData, A string representation of the URL to the data file. Default is "./data/FEMA_FIRM_FloodPolygons.json"
 * @returns {undefined} , nothing is returned
 */
function loadDataAndInitiateClassInstance(urlToData="./data/FEMA_FIRM_FloodPolygons.json"){
  fetch(urlToData, {
    headers : { 
      // 'Content-Type': 'application/json',
      // 'Accept': 'application/json'
    }
  })
    .then(function (response) {
      console.log('response message:', response); 
      var data = response.json()
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
}

/**
 * This function starts calling the initial JavaScript functions after the HTML is loaded. 
 * Specifically it calls the loadDataAndInitiateClassInstance () function.
 * @returns {undefined} , nothing is returned
 */
 window.addEventListener('load', (event) => {
  loadDataAndInitiateClassInstance()
});