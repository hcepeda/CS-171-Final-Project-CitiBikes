CS171 NYCitiBike Final Project

Link to final project video: https://www.youtube.com/watch?v=hIVb7JG512w&feature=youtu.be

Link to project URL: https://hcepeda.github.io/CS-171-Final-Project-CitiBikes/about.html


about.html
----------
Page showing the purpose of Citibike, how they've grown, and information on their users through their entire history. Linked to main_about.js, which houses various graphics. 

    - Chord_Diagram.js: Contains the code used to the create the chord diagram.
    - CitiLine.js: Contains the code to create the first line graphs of the number of trips taken, smoothed by a rolling average of 5 days
    - CitiLive_v2.js: Contains the code for the double line chart of the number of stations and the number of bikes
    - subscriber_barchart.js: Contains the code for the stacked bar chart + zoom and filter implementations.

    Data sources:
    - Compiled_V2.csv: Contains daily information on the number of bikes and stations
    - sample-data.csv: Actually not needed for this.
    - chord_data_3.csv: Dataset containing the chord data
    - monthly_members.csv: Dataset containing each month's number of 3, 7, and daily passes sold, as well as current number of annual subscribers. Pulled from monthly executive reports

    Python Scripts:
    - Python was used for data pre-processing to limit amount of computation during user-load.
    - neighborhood.py: Determined each stations neighborhood and borough by referencing it's lat/long coordinates to NYCOpenData city limits.
    - Merge_complete.py: Consolidated quarterly csv files into one large dataset to determine when unnique stations and bike ids were added, as well as to take a random 1M sample for the arc diagram.

    Credit:
    - Timeline template from tutsplus on cssscript.com (https://www.cssscript.com/responsive-timeline-slider-javascript-css/).

index.html
----------
Daily visualization page. Linked to main.js which uses visualization objects in totalvis.js, duration.js, gender.js, age.js, subscriber.js, and NYMap.js to create the visualizations seen on the page. totalvis.js is linked to all of them in order to increase the usability. 

team.html
----------
Page for team bios.

random.html/random.js
----------
Not included in final website, but used to download a random sample of the total data

NYMap.js
-----------
Map showing the various stations of Citibike, both starting and ending stations as well as their paths. It is linked to main.js along with various other visualizations. It has searching functionality, as well as various features described on the page when you click and hover over elements in the map (the markers and the routes). Routes are filtered starting at top 10 and increase in number as you zoom in. 
	NYMap.js: Contains the code used to create the map.
	leaflet-search.min.js, leaflet-search.src.js, leaflet-search.src.js: used for the searching feature on map
	leaflet-src-esm.js, leaflet-src.esm.js.map, leaflet-src.js, leaflet-src.js.map, leaflet.js, leaflet.js.map: used to create map
	leaflet.js: main leaflet script used for leaflet functions
	Leaflet.MultiOptionsPolyline.min.js: originally used for routes until a more efficient way was found
	leaflet.spin.js: originally used for loading page until simpler method was used
	leaflet.textpath.js: used to write text into line (bike icon and arrow) to show direction of routes


	Data Sources:
	-Subway-Lines.json: originally used to show subway lines on map; taken away because of clutter per Celina's advice
	-sample-data.csv: used to gather data for map
	-marker-blue, green, red, and yellow.png used to create custom markers
	-search-icon.png used for map search
	-marker-shadow.png, layers.png, layers-2x.png: used for map
	-loader.gif: used for loading screen

