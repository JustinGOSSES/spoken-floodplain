# houston-hackathon-spoken-floodplain

Placeholder for a potential houston hackathon project about website that verbally tells users when they enter or leave a floodplain as a supplemental approach to the traditional maps geared to users on the move.

#### Summary of Hackathon Project Idea
A website that tells a drive when they enter or leave a floodplain, so they don't have to look at a map probably made for desktops on a tiny phone.

#### Potential Technology
- Browser Web API for text-to-speech
- Browser Web API for location sharing
- Geojson of floodplains in Houston area
- JavaScript code to check if location inside of geojson's
- JavaScript code to parse geojson properties and location relative information into text message
- JavaScript to turn text to speech
- JavaScript to control timing
- JavaScript, CSS, and HTML for front-end user interface and optional map

#### User Experience
The basics of this idea's user experience: 
- The user is the driver of the car or rider of bicycle.
- The user clicks to share with the page location and speaker permissions at start, probably when not driving.
- The website is front-end only, so it doesn't actually send any user data anywhere. However, this permission must still be given for it to work.
- The website, after permissions are granted, checks the user's location and says whether it is inside a floodplain boundary every X unit of time as configured and/or the direction and distance of the nearest floodplain.

## Premise
Map data is nearly always experienced in 2D geographic format. This, of course, makes sense and is best way for most uses. However, there are situations where other ways of experiencing the same information might make more sense. For example, when you're traveling in a car, you might not want to click on buttons or stare at a screen. For this reason, text-to-speech is a standard part of driving directions from your phone.

When driving around looking at houses to potentially buy, the process knowing if the house in front of you at that instant is in the flood plain isn't super smooth. Although there are websites that show the floodplain extent nicely, like https://www.harriscountyfemt.org/# , the site doesn't put your location on the map itself. If you're not familiar with the streets in question and where exactly you are, it can be difficult to locate yourself on the flood plain map quickly. Additionally, you have to look at the screen and squint at the map because it has a limited zoom functionality, which is likely not an option if you are the driver. 

_The goal of this experiment is to see if location + text-to-speech can create a new way of experiencing where flood plains are located that is both less abstract and more in the average house shopers typical workflow._ 

## Data

### Flood Plain Maps Houston Only
https://data.houstontx.gov/sr_Latn/dataset/harris-county-flood-zones/resource/9219732c-d156-46a0-ba46-48c2976f876e

https://cohgis-mycity.opendata.arcgis.com/datasets/788ac6b17c154be0ac72f2e7cde021f4_6/about

## Web APIs

### Web API for Text-to-Speech

### Web API for 

## Prior Art
- Stratigraphy-Speech:
  - link: https://observablehq.com/@justingosses/stratigraphy-speech
  - description: Observable notebook that asks for location & speech permissions that tells you a bit about the top layer of the geology you're standing on.

## Permissions On Start Issues


## Privacy Concerns


## Accuracy & Legal Concerns


## Potential Variables

- How often location is checked
- What information is provided to user as speech. 
  - Is this configurable in terms of more or less information. 
  - Can this be configured to vary based on how close to floodplain?
