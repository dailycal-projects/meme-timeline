import csv
import json
import requests
from time import sleep

endpoint = 'https://graph.facebook.com/v2.10/'
access_token = ''

fields = [
    'message',
    'full_picture',
    'created_time',
    'updated_time',
    'likes.limit(0).summary(true)',
    'reactions.limit(0).summary(true)',
    'comments.limit(0).summary(true)',
    'permalink_url',
    'from'
]

payload = {
    'access_token': access_token,
    'fields': ','.join(fields),
    'limit': 100
}

class MemeScraper:
    """
    Handles getting meme data from a single school.
    """
    def __init__(self, groupID, schoolName, slug):
        print('Getting data for ' + schoolName)

        self.posts = []
        self.schoolName = schoolName
        self.slug = slug
        self.url = endpoint + str(groupID) + '/feed'
        self.requestsCounter = 0
        
        self.scrape_page(self.url, payload)

    def scrape_page(self, url, payload=None):
        """
        Hit Facebook API and handle pagination. When there are
        no more pages, finish.
        """
        self.requestsCounter += 1
        print('Page {}'.format(self.requestsCounter))

        r = requests.get(url, params=payload)
        response = r.json()

        if response.get('error'):
            raise Exception(response['error']['message'])
        else:
            self.parse_response(response)

        try:
            next_url = response['paging'].get('next', None)
            sleep(1)
            self.scrape_page(next_url)
        except:
            self.sort_data()
            self.write_data()

    def parse_response(self, response):
        """
        Parse response from Facebook API into posts list.
        """
        for data in response['data']:
            post = {}
            post['school'] = self.schoolName
            post['slug'] = self.slug
            post['post_id'] = data['id']
            post['permalink_url'] = data['permalink_url']
            post['created_time'] = data['created_time']
            post['num_likes'] = data['likes']['summary']['total_count']
            post['num_reactions'] = data['reactions']['summary']['total_count']
            post['num_comments'] = data['comments']['summary']['total_count']
            post['from_name'] = data['from']['name']
            post['from_id'] = data['from']['id']

            post['message'] = data.get('message', None)
            post['picture_url'] = data.get('full_picture', None)
            post['updated_time'] = data.get('updated_time', None)

            self.posts.append(post)

    def sort_data(self):
        """
        Sort posts list by number of reactions.
        """
        self.posts.sort(key=lambda d: d['num_reactions'], reverse=True)

    def write_data(self):
        """
        Write posts list to CSV in the data folder.
        """
        with open('src/data/schools/{}.csv'.format(self.slug), 'w') as outfile:
            writer = csv.DictWriter(outfile, fieldnames=[
                'school',
                'slug',
                'post_id',
                'permalink_url',
                'created_time',
                'updated_time',
                'num_likes',
                'num_reactions',
                'num_comments',
                'message',
                'picture_url',
                'from_name',
                'from_id'
            ])
            writer.writeheader()
            writer.writerows(self.posts)


with open('src/data/data.json', 'r') as infile:
    schools = json.load(infile)['schools']

    for school in schools:
        if school.get('id'):
            MemeScraper(school['id'], school['school'], school['slug'])
