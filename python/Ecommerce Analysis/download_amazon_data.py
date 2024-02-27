import requests
import os
import json

url = "https://real-time-amazon-data.p.rapidapi.com/search"

headers = {
    "X-RapidAPI-Key": "",
    "X-RapidAPI-Host": "real-time-amazon-data.p.rapidapi.com"
}

result = []
keyword = "jewelry"

pages = 50
for i in range(0, pages):
    querystring = {"query": keyword,
                   "page": str(i+1),
                   "country": "US",
                   "category_id": "aps"}

    print('Query: ' + str(querystring))
    response = requests.get(url, headers=headers, params=querystring)
    response = response.json()

    result.append(response['data']['products'])
    print("Page " + str(i+1) + " done")

# flatten results
result = [item for sublist in result for item in sublist]

# clear file
open('amazon_' + keyword + '.json', 'w').close()

# write to file
with open('amazon_' + keyword + '.json', 'a') as f:
    f.write(json.dumps(result, indent=4))
