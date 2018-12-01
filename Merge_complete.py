import pandas as pd
import glob, os
import csv
inputfiles = glob.glob("/Users/PeterAyala/Desktop/CS171_L/final_project/CS-171-Final-Project-CitiBikes/Complete_Citibike_Data/*.csv")
df_list = []

for filename in sorted(inputfiles):
    df_list.append(pd.read_csv(filename))
for sub_df in df_list:
    sub_df.columns = sub_df.columns.str.lower()
    try:
        sub_df.rename(columns = {'trip duration': 'tripduration',
        'start time': 'starttime',
        'stop time': 'stoptime',
        'bike id': 'bikeid',
        'user type': 'usertype'}, inplace = True)
    except Exception:
        pass

full_df = pd.concat(df_list, sort=False)

full_df.shape
full_df.columns

full_df['starttime'] = pd.to_datetime(full_df['starttime'])

full_df.sort_values(by = "starttime", inplace = True)

full_df.to_csv("Absolute_Complete_69M.csv")

stations_occurence = full_df.drop_duplicates(subset = "start station name")
bike_occurence = full_df.drop_duplicates(subset = "bikeid")

AboutCitiBike = pd.read_csv("/Users/PeterAyala/Desktop/CS171_L/final_project/CS-171-Final-Project-CitiBikes/data/Compiled.csv")
AboutCitiBike['Date'] = pd.to_datetime(AboutCitiBike['Date'])

vect_of_additions = [stations_occurence[stations_occurence['starttime'] < x].shape[0] for x in AboutCitiBike['Date']]
vect_of_bike_adds = [bike_occurence[bike_occurence['starttime'] < x].shape[0] for x in AboutCitiBike['Date']]

AboutCitiBike['num_stations'] = vect_of_additions
AboutCitiBike['num_bikes'] = vect_of_bike_adds

#AboutCitiBike = AboutCitiBike.drop(columns=["Unnamed: 10", "Unnamed: 11"])
AboutCitiBike.to_csv("Compiled_V2.csv")
