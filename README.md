# Spoken-floodplain

<b>A website that _verbally_ tells users when they enter or leave a floodplain as they are ON THE MOVE.</b>

WHY BUILD THIS? => The idea is this would be a supplemental approach to the traditional floodplain maps.

Most of the other floodplain maps online that I've tried that tend to assume users are:
- (1) sitting at a computer and 
- (2) looking at either a whole city or a singular address. 

_This is an experiment in taking floodplain information and providing it in a different way that changes how people experience it. There is a hypothesis here that if floodplain information is experienced while actually in a place, it changes how people process it compared to the same information represented later in an abstract map form._

Although this implimentation is specific to floodplains in Harris County (Houston) Texas, the basic idea might be extended to any geojson file or files.

## live site 

https://justingosses.github.io/spoken-floodplain/

Slides following the Houston Hackathon template: https://docs.google.com/presentation/d/1kz7w97LEenhE0t2bj9gjVpCtbpgohDKEAaqHmn88WYE/edit?usp=sharing

This was built as part of the <a href="https://houstonhackathon2022.devpost.com/">Houston Hackathon</a> by the participants listed <a href="https://devpost.com/software/spoken-floodplain">here</a>. 


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

## Getting the Floodplain Data in Geojson Format
Tried a few places to find good floodplain & floodway geojson files specific to boundary of City of Houston or Harris County. 

Might do a write up eventually of things that don't work or bugs along the way in some of the datasets people stumble upon via a web search. For now, this top option below seems workable.

- Link to general information about different FEMA flood-related GIS data sources: https://msc.fema.gov/portal/home
- FEMA National Flood Hazard Layer County-Clipped GIS Data Selector: https://hazards-fema.maps.arcgis.com/apps/webappviewer/index.html?id=8b0adb51996444d4879338b5529aa9cd
- Download link to the Harris county Dataset using the data selector map above: https://msc.fema.gov/portal/downloadProduct?productID=NFHL_48201C

Further description of how to download and then how to process the GIS datasets in shapefile and other formats into a single GEOJSON that can be 
worked with on the web is found in a Jupyter Notebook in the notebooks folder called `FEMA FIRM COUNTY LEVEL DATA HARRIS Shapefile to GEOJSON.ipynb`.

## PLANNING
### Technology Used
Reuses free & open data. No server necessary, all front-end. All technology capabilities necessary already exists, just not combined in this way, which made it well suited for a short hackathon.

- [browser capabilities to call]
  - <a href="https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis">Browser API for text-to-speech or speech synthesis</a>
  - <a href="https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API">Browser API for location sharing</a>
- [data] 
  - Geojson of floodplains in Houston area, described in section above.
- [JavaScript] 
  - code to call browser APIs for location and speech synthesis.
  - code to check if location inside of geojson's polygons (turf.js)
  - code to parse geojson properties and location relative information into text message
  - code to control timing
  - code for front-end user interface and optional map (leaflet.js)

#### Browser Web APIs
Modern browsers enable location sharing through the Location Browser API as described here: https://developer.mozilla.org/en-US/docs/Web/API/Location

#### Browswer Web API for Text-to-Speech
Modern browsers enable basic text-to-speech capabilities through a browswer API as described here: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API

#### Turf.js
Turf.js will be used to determine if the coordinates of the user's location is within a floodplain polygon and return whether it is 500 year plain, 100 year floodplain, or floodway.

#### Leaflet.js
Leaflet.js will be used to display the user's location on a map with an overlay of the floodplains and floodway.

## Considerations
#### Prior Art
- Stratigraphy-Speech:
  - link: https://observablehq.com/@justingosses/stratigraphy-speech
  - description: Observable notebook that asks for location & speech permissions that tells you a bit about the top layer of the geology you're standing on. This code could be used as a starting point for this project.

#### Permissions On Start Issues
Location sharing and text-to-speech require the user to actively approve each time the page is loaded. Some people may set defaults to stop the page from even asking for permission. Others may have set their browser to only ask once. The typical default behavior is to ask on each page load. 

This variation in potential user behavior and browser configurations needs to be included in design. Learnings of what settings need to be changed and best way to give instructions to users will likely be built up over time based on learnings.

#### Potential Technology Issues that Could Require More Time than Hackathon so Where Derisked Before Hackathon
- [Confirmed not an unsolvable issue] Size of Geojson files
  - Was worried that the total size of the geojson files would make page load so slow as to be unworkable. Loaded a few of them into an Observable notebook. There was a wait but nothing unworkable. There's likely ways to improve page load time further, so a surmountable issue.
- [Confirmed not an issue] Whether location sharing permission granting works only once or the entire time a page is loaded. 
  - Messed around in an Obserbable notebook. Once you give permission, looks like the web api for location can be set up to continuously gives location and speed and bearing are optional requests.

#### Privacy Concerns to be Addressed in User Interface
Sometimes people will have location sharing turned off in their browswer as they don't want to share location data. The page will need to tell people what tracking is and is not active on the page.

#### Accuracy & Legal Concerns
Due to the potential decisions made with this data, there will need to be a disclaimer message like on other products with similar data stating that they should only use authoritative and recent data from FEMA before making any engineering or legal decisions.

