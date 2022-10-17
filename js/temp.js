////////// TURF CODE

//var turfPoint = turf.point([-95.498,29.7604]);

// function searchWithinPolygonsForPoint(polygons,turfPoints,isLocationWithinOneFloodplainPolygon){
//   console.log("turfPoint",turfPoints)
//   console.log("polygons",polygons)
//   // var dataGlobal = [-95.498,29.7604]
//   // var temp_point_in_floodplain = []
//   var numberPolygons = polygons.features.length
//   console.log("number of polygons",numberPolygons)
//   console.log('Polygons.features 0',polygons.features[0])
//   var newLocationState = "unknown"
//   for (let i = 0; i < numberPolygons; i++) {
//     var searchWithin = turf.polygon(polygons.features[0].geometry.coordinates);
//     var ptsWithin = turf.pointsWithinPolygon(turfPoints, searchWithin);
//     if(ptsWithin.features.length != 0){
//       newLocationState = "inside"
//       console.log("new location is within this polyon",ptsWithin);
//       //// This calls the text to speech capabilities of the browser and says a user is within the floodplain
//     }
//     else{
//       newLocationState = "outside"
//       // console.log("new location is within this polyon",ptsWithin);
//     }
//   }
//   checkLocationStateAndUpdate(newLocationState)
// }

// function checkLocationStateAndUpdate(newLocationState){
//   //// checks if current state and past state are different.
//   //console.log("comparison",isLocationWithinOneFloodplainPolygon.localeCompare(newLocationState))
//   if(newLocationState == isLocationWithinOneFloodplainPolygon){
//      //// if states are same, do nothing
//     console.log("In function checkLocationStateAndUpdate(), newLocationState == isLocationWithinOneFloodplainPolygon")
//     console.log("This means no change in location state, which is: ",isLocationWithinOneFloodplainPolygon, "the floodplain")
//     if(sayEveryMeasurement){
//       if(newLocationState == "inside"){
//         let withinFloodplainSpeak = new SpeechSynthesisUtterance("Your recently measured location is within the floodplain."); 
//         speechTool.speak(withinFloodplainSpeak);
//       }
//       else{
//         let notWithinFloodplainSpeak = new SpeechSynthesisUtterance("Your recently measured location is outside the floodplain."); 
//         console.log("type notWithinFloodplainSpeak",typeof(notWithinFloodplainSpeak))
//         speechTool.speak(notWithinFloodplainSpeak);
//       }
//     }
//   }
//   //// if states different
//   else{
//     isLocationWithinOneFloodplainPolygon = newLocationState
//     ///// then say new location state
//     if(newLocationState == "inside"){
//         let withinFloodplainSpeak = new SpeechSynthesisUtterance("Your recently measured location is within the floodplain."); 
//         speechTool.speak(withinFloodplainSpeak);
//     }
//     else{
//         console.log("newLocationState ",newLocationState )
//         console.log("isLocationWithinOneFloodplainPolygon ",isLocationWithinOneFloodplainPolygon )
//         let notWithinFloodplainSpeak = new SpeechSynthesisUtterance("Your recently measured location is outside the floodplain."); 
//         console.log("type notWithinFloodplainSpeak",typeof(notWithinFloodplainSpeak))
//         speechTool.speak(notWithinFloodplainSpeak);
//     }
//     ///// then update new state in variablew location state
    
//   }
//   return ""
// }



// // not used?
// function startCheckingLocationEveryInterval(){
//   insideLoopFunction()
//   // interval = setInterval(function() {insideLoopFunction();}, 20000)
// }

