import json
import urllib.request

with open('src/data/data.json', 'r') as infile:
	data = json.load(infile)

	for row in data['memes']:
		print(row['picture_url'])

		path = 'src/images/{}.jpg'.format(row['post_id'])
		urllib.request.urlretrieve(row['picture_url'], path)
