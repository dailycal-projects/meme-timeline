import json
import csv
from collections import Counter

with open('src/data/data.json', 'r') as infile:
    schools = json.load(infile)['schools']
    school_list = [school['slug'] for school in schools if school.get('id')]

members = Counter();

for school in school_list:
	with open('data/members/{}.csv'.format(school), 'r') as infile:
		reader = csv.DictReader(infile)
		for row in reader:
			members[(row['id'], row['name'])] += 1

counts = Counter()

for k, v in members.items():
	counts[v] += 1

with open('src/data/member_counts.csv', 'w') as outfile:
	writer = csv.writer(outfile)
	writer.writerow(['num_groups', 'num_members'])
	writer.writerows([(k, v) for k, v in counts.items()])
