/////////////////////////////////

spokenGeoJSON_Harris_global = ""

//class spokenGeoJson(divIdForMapString){
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
    this.withinFloodplainSpeak = "none";
    this.notWithinFloodplainSpeak = "none";
    this.sayEveryMeasurement = true;
    /* PROPERTIES: timing */
    this.timeIntervalTriggered = false;
    this.interval = "";
    this.showPosition = this.showPosition.bind(this)
  }
    // //////////////// METHODS //////////////////////////
    //  /* METHODS: data load functions*/
    // /**
    //  * This function fetches the geojson that holds all the data applied to the map. It must be called before other map-related functions
    //  * @returns {undefined} , nothing is returned
    //  */
    // fetches(){
    //   fetch("./data/FEMA_FIRM_FloodPolygons.json", {
        
    //     headers : { 
    //       // 'Content-Type': 'application/json',
    //       // 'Accept': 'application/json'
    //     }

    //   })
    //     .then(function (response) {
    //       console.log('response message:', response); 
    //       var data = response.json()
    //       //console.log('data early, json :', data);
    //       // await addFeatureToMap(data) 
    //       // setTimeout(function(data) {
    //       //   return addFeatureToMap(data) ;
    //       // }, 10000);
    //       return data;
    //     })
    //     .then(function (data) {
    //       // use geoJSON
    //       polygons = data
    //       console.log('data', data); 
    //       L.geoJSON(data, {
    //         onEachFeature: this.onEachFeature,
    //       }).addTo(this.map);
    //     });
    // }
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
  getLocation(withinFloodplainSpeak,notWithinFloodplainSpeak) {
    if (navigator.geolocation) {
      // $('#trigger').trigger('click')
      //// This calls the function showPosition with an argument of the position of the device.
      //// We'll assume that the geojson polygons is already loaded.
      console.log("got into getLocation function before checking if introductionSpeechSaid == false")
      // withinFloodplainSpeak = new SpeechSynthesisUtterance("Your recently measured location is within the floodplain."); 
      // notWithinFloodplainSpeak = new SpeechSynthesisUtterance("Your recently measured location is outside the floodplain."); 
      //// Change button focus state
      var element = document.getElementById("start");
      element.classList.add("selected");
      var elmentOther =  document.getElementById('stop');
      elmentOther.classList.remove('selected');
      while(this.introductionSpeechSaid == false){
        this.speechTool = window.speechSynthesis
        console.log("got into getLocation function and introductionSpeechSaid == false")     
        let introSpeak= new SpeechSynthesisUtterance("Location services activated."); //If you do not want to be asked again, be sure to click the remember this decision checkmark. 
        
        //startCheckingLocationEveryInterval()
        console.log("startCheckingLocationEveryInterval() on line above")
        console.log("timeIntervalTriggered is set to:",this.timeIntervalTriggered)
        this.timeIntervalTriggered = true
        console.log("timeIntervalTriggered is set to:",this.timeIntervalTriggered)
        window.speechSynthesis.speak(introSpeak);
        this.insideLoopFunction()
        this.introductionSpeechSaid = true
      }
      // else{
        console.log("got into getLocation function and introductionSpeechSaid != false.")
        // if(timeIntervalTriggered != false){
          //console.log("IN FUNCTION getLocation, returnedResult",returnedResult)
          this.interval = setInterval(function() {
            this.insideLoopFunction();
          }, 10000)
        // }
        // else{
        //   console.log("got here? shouldn't get here")
        // }
      //}
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

  
  /* METHODS: initiation*/

  /* METHODS: location looping */
  insideLoopFunction(){
    //var position = navigator.geolocation.watchPosition(showPosition);
    //var position = navigator.geolocation.getCurrentPosition(this.showPosition);
    var position = navigator.geolocation.getCurrentPosition(this.showPosition);
    console.log("navigator value in insideLoopFunction",this.position)
    console.log('test global variable showPositionPoints',this.showPositionPoints)
  //////////////
    
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
        // console.log("ptsWithin",ptsWithin)
        // console.log("ptsWithin.features.length",ptsWithin.features.length)
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
    // checkLocationStateAndUpdate(newLocationState)
  //////////////
  
    // checks if current state and past state are different.
    // console.log("comparison",isLocationWithinOneFloodplainPolygon.localeCompare(newLocationState))
    if(newLocationState == this.isLocationWithinOneFloodplainPolygon){
      //// if states are same, do nothing
     console.log("In function checkLocationStateAndUpdate(), newLocationState == isLocationWithinOneFloodplainPolygon")
     console.log("This means no change in location state, which is: ",isLocationWithinOneFloodplainPolygon, "floodplain")
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
  stopSpeechUtteranceAndLoop(reStateActivation=true){
    this.clearInterval(this.interval)
    console.log("used stopSpeechUtteranceAndLoop() function to cleare interval")
    this.timeIntervalTriggered = false
    if(reStateActivation){
      this.introductionSpeechSaid = false
    }
    console.log("used stopSpeechUtteranceAndLoop() function to set timeIntervalTriggered = false and introductionSpeechSaid = false")
    speechSynthesis.cancel()
    console.log("used stopSpeechUtteranceAndLoop() function to call speechSynthesis.cancel()")
    locationState = "noLocationKnownYet"
    console.log("used stopSpeechUtteranceAndLoop() function to set locationState = noLocationKnownYet")
    //// Change button focus state
    var element = document.getElementById("stop");
    element.classList.add("selected");
    var elmentOther =  document.getElementById('start');
    elmentOther.classList.remove('selected');
  }
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
  
      console.log("sayEveryMeasurement after change = ",sayEveryMeasurement)
    } catch (e) {
        console.error(e, e.stack);
    }
    //// restart loop
    getLocation(withinFloodplainSpeak,notWithinFloodplainSpeak)
  }
  
  /* METHODS: change configurations */
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
 * Specifically it calls the fetches function
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