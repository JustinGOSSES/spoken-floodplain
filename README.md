# houston-hackathon-spoken-floodplain

Placeholder for a potential houston hackathon project about website that verbally tells users when they enter or leave a floodplain as a supplemental approach to the traditional maps geared to users on the move.

SIGN UP FOR THE HACKATHON ON SEPT 16th 2022 HERE: https://www.eventbrite.com/e/houston-hackathon-2022-registration-403212378077

## Summary of Hackathon Project Idea
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
- The website, after permissions are granted, checks the user's location and verbally says whether it is inside a floodplain boundary every X unit of time as configured and/or the direction and distance of the nearest floodplain. 
- The user can keep driving and doesn't need to look at the website or interact with it. They just need to leave that page open on their device.

## Premise
Map data is nearly always experienced in 2D geographic format. This, of course, makes sense and is best way for most uses. However, there are situations where other ways of experiencing the same information might make more sense. For example, when you're traveling in a car, you might not want to click on buttons or stare at a screen. For this reason, text-to-speech is a standard part of driving directions from your phone.

When driving around looking at houses to potentially buy, the process of knowing if the house in front of you at that instant is in the flood plain isn't super smooth. Although there are websites that show the floodplain extent nicely, like https://www.harriscountyfemt.org/# , the site doesn't put your location on the map itself. If you're not familiar with the streets in question and where exactly you are, it can be difficult to locate yourself on the flood plain map quickly. Additionally, you have to look at the screen and squint at the map because it has a limited zoom functionality, which is likely not an option if you are the driver. 

_The goal of this experiment is to see if location + text-to-speech can create a new way of experiencing where flood plains are located that is both less abstract and more in the average house shopers typical workflow._ 

This prototype will be built with geojson data specific to the Houston area bundeled with the code of the page. The approach could be extended to other locations. However, if you want to cover very large areas, you'd likely want to build the page such that the data is not bundeled but only downloaded in small pieces a close distance around the location of the user. Otherwise, the download time of the data will make the page load too slow. 

## Data

### 500 Year Flood Plain Maps Houston Only
https://data.houstontx.gov/sr_Latn/dataset/harris-county-flood-zones/resource/9219732c-d156-46a0-ba46-48c2976f876e

https://cohgis-mycity.opendata.arcgis.com/datasets/788ac6b17c154be0ac72f2e7cde021f4_6/about

This data is in geojson format, which makes it easiest to work with on the web. It is in the `/data` directory.

Note this repository might load slowly due to the data involved. LFS (Large File Storage) is used to store it on GitHub.
If you are forking this repository, you may want to set up LFS. Google how to do this for your operating system. 

Need the 100 year floodplains and the floodway maps as well. 

The size of 500 year floodplain geojson for Harris county is 91MB, which would make page load slow. Might need to dissolve into fewer number of features and then cut into smaller tile areas such that the whole thing doesn't have to load on page load but just a small area around the actual location of the user maybe?

## Web APIs
Modern browsers enable location sharing through the Location Browser API as described here: https://developer.mozilla.org/en-US/docs/Web/API/Location

### Web API for Text-to-Speech
Modern browsers enable basic text-to-speech capabilities through a browswer API as described here: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API

## Prior Art
- Stratigraphy-Speech:
  - link: https://observablehq.com/@justingosses/stratigraphy-speech
  - description: Observable notebook that asks for location & speech permissions that tells you a bit about the top layer of the geology you're standing on. This code could be used as a starting point for this project.

## Permissions On Start Issues
Location sharing and text-to-speech require the user to actively approve each time the page is loaded. Some people may set defaults to stop the page from even asking for permission. Others may have set their browser to only ask once. The typical default behavior is to ask on each page load. This variation in potential user behavior and browser configurations needs to be included in design.

## Privacy Concerns
Sometimes people will have location sharing turned off in their browswer as they don't want to share location data. The page will need to tell people that 
(1) this page won't actually share any of your location data, just use it locally on the page (2) let them know that they may see browser messages about sharing data as the browser is not able to tell the difference between (a) location data that is just used on the page on their device and (b) location data that is sent back to some server.


## Accuracy & Legal Concerns
Due to the potential decisions made with this data, there will need to be a click through screen with a disclaimer like on other products with similar data.


## Potential Variables

- How often location is checked
- What information is provided to user as speech. 
  - Is this configurable in terms of more or less information. 
  - Can this be configured to vary based on how close to floodplain?
