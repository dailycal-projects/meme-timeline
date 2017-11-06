import json
import pandas as pd

with open('src/data/data.json', 'r') as infile:
    schools = json.load(infile)['schools']
    school_list = [school['slug'] for school in schools if school.get('id')]

dfs = [pd.read_csv('src/data/schools/{}.csv'.format(s)) for s in school_list]

df = pd.concat(dfs)

df = df.assign(created_time=pd.to_datetime(df.created_time))

df = df.sort_values(by='created_time')

df = df.assign(date=df.created_time.dt.strftime('%Y-%m-%d'))

df = df.assign(week=df.created_time.dt.strftime('%Y-%U'))

grouped = df.groupby(['school','date']).count()['post_id'].reset_index()

grouped = grouped.assign(count=grouped.groupby('school')['post_id'].cumsum())

pivot = grouped.pivot(index='date', columns='school', values='count').reset_index()

pivot = pivot.fillna(method='pad').fillna(0)

pivot.to_csv('src/data/weekly_counts.csv')