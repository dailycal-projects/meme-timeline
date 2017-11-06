import json
import pandas as pd

dfs = []

with open('src/data/data.json', 'r') as infile:
    schools = json.load(infile)['schools']

    for school in schools:
        if school.get('id'):
            df = pd.read_csv('src/data/schools/{}.csv'.format(school['slug']))
            df = df[(df.created_time > '2017-01-01')].sort_values('created_time')
            df = df.sort_values('num_reactions', ascending=False).head(100)
            dfs.append(df)

df = pd.concat(dfs)

df[[
	'slug',
	'post_id',
	'created_time',
	'permalink_url',
	'num_reactions'
]].to_json('src/data/memes.json', orient='records')