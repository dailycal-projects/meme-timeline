import csv
import json
import requests
from time import sleep

endpoint = 'https://graph.facebook.com/v2.10/'
access_token = ''

payload = {
    'access_token': access_token,
    'limit': 1000
}

class MemeScraper:
    """
    Handles getting meme data from a single school.
    """
    def __init__(self, groupID, schoolName, slug):
        print('Getting data for ' + schoolName)

        self.members = []
        self.schoolName = schoolName
        self.slug = slug
        self.url = endpoint + str(groupID) + '/members'
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
            self.write_data()

    def parse_response(self, response):
        """
        Parse response from Facebook API into posts list.
        """
        for data in response['data']:
            self.members.append({
                'name': data['name'],
                'id': data['id'],
                'school': self.schoolName
            })

    def write_data(self):
        """
        Write posts list to CSV in the data folder.
        """
        with open('data/members/{}.csv'.format(self.slug), 'w') as outfile:
            writer = csv.DictWriter(outfile, fieldnames=['name', 'id', 'school'])
            writer.writeheader()
            writer.writerows(self.members)


with open('src/data/data.json', 'r') as infile:
    schools = json.load(infile)['schools']

    for school in schools:
        if school.get('id'):
            MemeScraper(school['id'], school['school'], school['slug'])
