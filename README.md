CS171 NYCitiBike Final Project

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
- Python was used for data preprossessing to limit amount of computation during user-load. 
- neighborhood.py: Determined each stations neighborhood and borough by referencing it's lat/long coordinates to NYCOpenData city limits.
- Merge_complete.py: Consolidated quarterly csv files into one large dataset to determine when unnique stations and bike ids were added, as well as to take a random 1M sample for the arc diagram. 

index.html
----------
Daily visualization page. Linked to main.js which uses visualization objects in totalvis.js, duration.js, gender.js, age.js, subscriber.js, and NYMap.js to create the visualizations seen on the page.


timeline.html
----------

team.html
----------
Page for team bios.

random.html/random.js
----------
Not included in final website, but used to download a random sample of the total data
