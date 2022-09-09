# Spoken-floodplain

Placeholder for a potential houston hackathon project that is...

<b>A website that _verbally_ tells users when they enter or leave a floodplain as they are ON THE MOVE.</b>

WHY BUILD THIS? => The idea is this would be a supplemental approach to the traditional floodplain maps that are typically experienced through websites that assume users are:
- (1) sitting at a computer and 
- (2) looking at either looking at a whole city or a singular address. 

_This is an experiment in taking floodplain information and providing it in a different way that changes how people experience it. There is a hypothesis here that if floodplain information is experienced while actually in a place, it changes how people process it compared to the same information represented later in an abstract map form._

SIGN UP FOR THE HACKATHON ON SEPT 16th 2022 HERE: https://www.eventbrite.com/e/houston-hackathon-2022-registration-403212378077


## User Experience
We could imagine the user is driving around during house shopping.

The basics of this idea's user experience: 
- The user is the driver of the car or rider of bicycle.
- The user opens the website
- The user clicks to give permission to share their device's location and speaker permissions upon opening the page, probably when not driving.
  - NOTE: The website is front-end only, so it doesn't actually send any user data anywhere. However, this permission must still be given. 
- The website, after permissions are granted, checks the user's location and verbally says whether it is inside a floodplain boundary every X unit of time as configured and/or the direction and distance of the nearest floodplain. 
- The user can keep driving and doesn't need to look at the website or interact with it. They just need to leave that page open on their device and keep listening.
  - The user then experiments information about floodplain while being directly in a place instead of attaching that information to a previous memory via an abstract map. 

## Premise
##### You already use maps & text-to-speech
Map data is nearly always experienced in 2D geographic format. This, of course, makes sense and is best way for most uses. However, there are situations where other ways of experiencing the same information might make more sense. For example, when you're traveling in a car, you might not want to click on buttons or stare at a screen. For this reason, text-to-speech is a standard part of driving directions from your phone.

##### User need that generated the hackathon idea
A past experience that helped inspire this idea was driving around looking at houses to potentially buy, the process of knowing if the house in front of you at that instant is in the flood plain isn't super smooth. 

##### Limitations of existing services for those on the move
Although there are websites that show the floodplain extent nicely, like https://www.harriscountyfemt.org/# , the site doesn't put your location on the map itself. If you're not familiar with the streets in question and where exactly you are, it can be difficult to locate yourself on the flood plain map quickly. Additionally, you have to look at the screen and squint at the map because it has a limited zoom functionality, which is likely not an option if you are the driver. 

##### Summary of what is being combined into a single experience
_The goal of this experiment is to see if location + text-to-speech services already built into any browser can create a new way of experiencing where flood plains are located that is both less abstract and more in the average house shoppers typical workflow._ 

This prototype will be built with geojson data specific to the Houston area bundeled with the code of the page. The approach could be extended to other locations. However, if you want to cover very large areas, you'd likely want to build the page such that the data is not bundeled but only downloaded in small pieces a close distance around the location of the user. Otherwise, the download time of the data will make the page load too slow. 

## First Pass Guess at Hackathon Roles/Tasks
- [non-code] Check performance of prototypes on multiple phone operating systems and browser makes if possible. 
- [non-code] Check prototype behavior under different permission & security default settings. Figure out how to tell users what to change if necessary. 
- [write javascript]Write code to load geojson files. 
- [code: python, javascript, other] Potentially merge (or split?) separate geojson files to improve load performance. May require using browser inspector to figure out what is slowing load speeds.
- [write javascript] Write javascript to calls turf.js to figure out if the coordinates of the user are in any of the polygons.
- [write javascript]Write javascript to turn text into speech.
- [non-code] Figure out what the application should say. 
- [non-code] Figure out how often the application should say something 
- etc. 

## Data
Tried a few places to find good floodplain & floodway geojson files specific to boundary of City of Houston or Harris County. 

Might do a write up eventually of things that don't work or bugs along the way in some of the datasets people might find via a web search. For now, this top option seems workable.


### City of Houston Geographic Information Management Service:
A webpage with graphic user interface and metadata descriptions: https://cohgims.houstontx.gov/arcgis/rest/services/FloodplainDataFMO/MapServer/

Layers:
- Historic FIRM (2007) (0)
  - Base Flood Elevation (1)
  - Cross Section Line (2)
  - Map Panel Number (3)
  - Map Change (4)
  - Conveyance Zone (5)
  - Flood Zone (6)
- Historic FIRM (2000) (7)
  - Flood Zone (8)
- Effective FIRM (1/6/2017) (9)
  - Base Flood Elevation (10)
  - Cross Section Line (11)
  - Cross Section - City Limits (2/28/2018) (12)
  - Map Panel Number (13)
  - Map Change (14)
  - Flood Zone (15)
  - Floodway (16)
  - 100 Year AE Zone (17)
  - 500 Year X Shaded (18)
  - A Zone, No BFE (19)
  - AO Zone, 1-3 Feet Depth (20)
  - VE Coastal Hazard, BEF (21)
  - Conveyance Zone (12/16/2016) (22)
  - 500 WSEL (23)
  - 500 Delta (24)
- Effective (TSARP) Catchment (25)
- Effective (TSARP) Watersheds (26)

An API call to get an actual GEOJSON back is such:
`https://cohgims.houstontx.gov/arcgis/rest/services/FloodplainDataFMO/MapServer/16/query?&where=objectid%3E0&f=geojson`

The number before query in the URL is what will need to be changed to get a different layer back.

*NOTE:* The site is normally a http site and not a https site. If you access the site through http, some methods of downloading the file will not work. It is best to:
1. Put the https URL in your browser address bar. 
2. Click "proceed anyways" when the scary notice about them not having a properly sit up https certificate comes up. 
3. Download again. 

You might not have the problem if you right click from the JSON content that appears on the page after you put the URL in the address bar. If you use CURL, you might not hav a problem. If you download using JavaScript embedded in a page, you will have the problem.

<!-- ### [Previous dataset...probably won't use this one] 500 Year Flood Plain Maps Houston Only
https://data.houstontx.gov/sr_Latn/dataset/harris-county-flood-zones/resource/9219732c-d156-46a0-ba46-48c2976f876e

https://cohgis-mycity.opendata.arcgis.com/datasets/788ac6b17c154be0ac72f2e7cde021f4_6/about

This data is in geojson format, which makes it easiest to work with on the web. It is in the `/data` directory.

Note this repository might load slowly due to the data involved. LFS (Large File Storage) is used to store it on GitHub.
If you are forking this repository, you may want to set up LFS. Google how to do this for your operating system. 

Need the 100 year floodplains and the floodway maps as well. 

The size of 500 year floodplain geojson for Harris county is 91MB, which would make page load slow. Might need to dissolve into fewer number of features and then cut into smaller tile areas such that the whole thing doesn't have to load on page load but just a small area around the actual location of the user maybe?

*Decided not to use this source as their API is broken for the floodway polygons.* -->

## Tools to be Used

#### Potential Technology
Reuses free & open data. No server necessary, all front-end. All technology capabilities necessary already exists. 

- [browser capabilities to call]
  - API for text-to-speech
  - API for location sharing
- [data] 
  - Geojson of floodplains in Houston area
- [JavaScript] 
  - code to check if location inside of geojson's
  - code to parse geojson properties and location relative information into text message
  - code to control timing
  - code for front-end user interface and optional map


### Browser Web APIs
Modern browsers enable location sharing through the Location Browser API as described here: https://developer.mozilla.org/en-US/docs/Web/API/Location

#### Browswer Web API for Text-to-Speech
Modern browsers enable basic text-to-speech capabilities through a browswer API as described here: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API

#### Browswer Web API for Location
TODO

### Turf.js
Turf.js will be used to determine if the coordinates of the user's location is within a floodplain polygon and return whether it is 500 year plain, 100 year floodplain, or floodway.

### Leaflet.js
Leaflet.js will be used to display the user's location on a map with an overlay of the floodplains and floodway.

## Considerations
#### Prior Art
- Stratigraphy-Speech:
  - link: https://observablehq.com/@justingosses/stratigraphy-speech
  - description: Observable notebook that asks for location & speech permissions that tells you a bit about the top layer of the geology you're standing on. This code could be used as a starting point for this project.

#### Permissions On Start Issues
Location sharing and text-to-speech require the user to actively approve each time the page is loaded. Some people may set defaults to stop the page from even asking for permission. Others may have set their browser to only ask once. The typical default behavior is to ask on each page load. This variation in potential user behavior and browser configurations needs to be included in design.

#### Potential Technology Issues that Could Require More Time than Hackathon
- [Confirmed not an issue] Size of Geojson files
  - Was worried that the total size of the geojson files would make page load so slow as to be unworkable. Loaded a few of them into an Observable notebook. There was a wait but nothing unworkable. There's likely ways to improve page load time further, so a surmountable issue.
- [Confirmed not an issue] Whether location sharing permission granting works only once or the entire time a page is loaded. 
  - Messed around in an Obserbable notebook. Once you give permission, looks like the web api for location can be set up to continuously gives location and speed and bearing are optional requests.

#### Privacy Concerns to be Addressed in User Interface
Sometimes people will have location sharing turned off in their browswer as they don't want to share location data. The page will need to tell people that 
(1) this page won't actually share any of your location data, just use it locally on the page (2) let them know that they may see browser messages about sharing data as the browser is not able to tell the difference between (a) location data that is just used on the page on their device and (b) location data that is sent back to some server.


#### Accuracy & Legal Concerns
Due to the potential decisions made with this data, there will need to be a click through screen with a disclaimer like on other products with similar data.


### Potential Configuration Variables

- How often location is checked
- What information is provided to user as speech. 
  - Is this configurable in terms of more or less information. 
  - Can this be configured to vary based on how close to floodplain?
