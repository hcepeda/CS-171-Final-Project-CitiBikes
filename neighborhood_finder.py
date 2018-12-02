import pandas as pd
import glob, os
import csv
import json
from shapely import geometry
import numpy as np

full_df = pd.read_csv("data/Absolute_Complete_69M.csv", index_col=0)
stations_occured = full_df.drop_duplicates(subset = "start station name")
AboutCitiBike = pd.read_csv("data/Compiled_v2.csv", index_col=0)

with open("data/Neighborhood_polygon.geojson") as f:
    data = json.load(f)
station_neighborhood = {}
station_borough = {}
#polygon = geometry.Polygon([x for x in data['features'][0]['geometry']['coordinates'][0][0]])
#test_point = geometry.Point([stations_occured['start station longitude'][0], stations_occured['start station latitude'][0]])

stations_occured.shape
#len(data['features'][38]['geometry']['coordinates'])
#data['features'][38]['geometry']['coordinates'][1][0]
# Takes about 30 seconds
for index, row in stations_occured.iterrows():
    station_point = geometry.Point([row['start station longitude'], row['start station latitude']])
    for i in range(len(data['features'])):
        for j in range(len(data['features'][i]['geometry']['coordinates'])):
            neigh_poly = geometry.Polygon(data['features'][i]['geometry']['coordinates'][j][0])
            #neigh_poly = geometry.Polygon([x for x in data['features'][i]['geometry']['coordinates'][0][0]])
            if neigh_poly.contains(station_point):
                station_neighborhood[row['start station name']] = data['features'][i]['properties']['ntaname']

                station_borough[row['start station name']] = data['features'][i]['properties']['boro_name']

sample_df = full_df.sample(n = 100000)
sample_df['neighborhood_start'] = sample_df['start station name'].map(station_neighborhood)
sample_df['borough_start'] = sample_df['start station name'].map(station_borough)
sample_df['neighborhood_end'] = sample_df['end station name'].map(station_neighborhood)
sample_df['borough_end'] = sample_df['end station name'].map(station_borough)
interesting_starts = np.unique([str(x) for x in sample_df['neighborhood_start']])[:-4]
chord_dict = {}

for starting_loc in interesting_starts:
    sub_df = sample_df[sample_df['neighborhood_start'] == starting_loc]
    chord_dict[starting_loc] = dict(sub_df['neighborhood_end'].value_counts())
#sub_df = sample_df[sample_df['neighborhood_start'] == "Astoria"]
#dict(sub_df['neighborhood_end'].value_counts())
sample_df.to_csv("data/random_sample.csv")
color_dict = {"Manhattan": "#333", "Brooklyn": "#34DDDD", "Queens": "#AAAAAA"}
#chord_dict['Astoria'].keys()
long_df = []
for key in chord_dict.keys():
    for sub_key in chord_dict[key]:
        temp = [key, sub_key, chord_dict[key][sub_key], sample_df[sample_df['neighborhood_start'] == key]['borough_start'].values[0]]
        long_df.append(temp)

np.unique(chord_dataframe['borough'])
chord_dataframe = pd.DataFrame(long_df, columns=["root", "node", "value", "borough"])
chord_dataframe['color'] = chord_dataframe['borough'].map(color_dict)
chord_dataframe = chord_dataframe[chord_dataframe['value'] >= 10]
chord_dataframe.to_csv("data/chord_data_3.csv")
color_vect = chord_dataframe.drop_duplicates(subset="root")
len(color_vect['color'].values)
color_vect.to_csv("data/colors_yee.csv")
