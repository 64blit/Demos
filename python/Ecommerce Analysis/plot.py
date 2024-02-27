import matplotlib.pyplot as plt
import numpy as np
import os
import json
import matplotlib.ticker as ticker
import matplotlib.colors as colors
import pandas as pd
import re

# Here we create a series of plots associating product rating, number of ratings, sales volume, best seller status, and Amazon's choice status with the presence of a person in the product photo.
#  The following is a snippet from the json file that contains the data we will use to create the plots:
# [
# {
#     "asin": "B07F3G3P93",
#     "product_title": "Udalyn Rhinestone Bridesmaid Jewelry Sets for Women Necklace and Earring set for Wedding with Crystal Bracelet",
#     "product_price": "$12.99",
#     "product_original_price": "$13.99",
#     "currency": "USD",
#     "product_star_rating": "4.3",
#     "product_num_ratings": 2258,
#     "product_url": "https://www.amazon.com/dp/B07F3G3P93",
#     "product_photo": "https://m.media-amazon.com/images/I/812vLiVWixL._AC_SR525,789_FMwebp_QL65_.jpg",
#     "product_num_offers": 0,
#     "product_minimum_offer_price": "$12.99",
#     "is_best_seller": false,
#     "is_amazon_choice": false,
#     "is_prime": true,
#     "person_count" : 1,
#     "climate_pledge_friendly": false,
#     "sales_volume": "50+ bought in past month",
#     "delivery": "FREE delivery Wed, Feb 28 on $35 of items shipped by AmazonOr fastest delivery Tomorrow, Feb 24",
#     "prediction": {
#         "objects": [
#             {
#                 "category": "person",
#                 "classId": 0,
#                 "classLabel": "person",
#                 "confidence": 0.875,
#                 "height": 637.498,
#                 "id": 2729,
#                 "orientation": 0,
#                 "width": 508.989,
#                 "x": 16.01,
#                 "y": 53.616
#             }
#         ],
#         "seconds": 0,
#         "source_height": 789,
#         "source_id": "0df18187-d2bf-11ee-8aab-0242ac110004",
#         "source_width": 525,
#         "system_timestamp": 1708742851101104000,
#         "timestamp": 0
#     }
# }, ...
# ]


def convert_string_to_number(s):
    if not s:
        return 0

    match = re.search(r'(\d+)(K)?\+', s)
    if match:
        number = int(match.group(1))
        if match.group(2) == 'K':
            number *= 1000
        return number
    else:
        return 0


def plot_volume_vs_person(data):
    volume = []
    people = []
    for product in data:
        volume.append(convert_string_to_number(product['sales_volume']))

        if 'objects' in product['prediction']:
            people.append(int(product['person_count']))
        else:
            people.append(0)

    # Convert volume and people to numpy arrays
    volume = np.array(volume)
    people = np.array(people)

    # Apply a log transformation to the volume and people arrays
    volume = np.log1p(volume)
    people = np.log1p(people)

    # round the transformed data to the nearest integer
    volume = np.round(volume)
    people = np.round(people)

    # make the volume and people arrays into integer arrays
    volume = volume.astype(int)
    people = people.astype(int)

    plot_heatmap(volume, people, 'Sales Volume / Month',
                 'Number of People', 'Sales Volume vs People In Photo')


def plot_best_seller_vs_person(data):
    best_seller = []
    people = []
    for product in data:
        best_seller.append(int(product['is_best_seller']))
        if 'objects' in product['prediction']:
            people.append(int(product['person_count']))
        else:
            people.append(0)

    # Convert best_seller and people to numpy arrays
    best_seller = np.array(best_seller)
    people = np.array(people)

    # Apply a log transformation to the best_seller and people arrays
    # people = np.log1p(people)
    # round the transformed data to the nearest integer
    # best_seller = np.round(best_seller)
    # people = np.round(people)

    # make the best_seller and people arrays into integer arrays
    best_seller = best_seller.astype(int)
    people = people.astype(int)

    plot_heatmap(best_seller, people, 'Best Sellers',
                 'Number of People', 'Best Seller vs Number of People')


# here we create a scatter plot of the product rating and whether a person is present in the product photo
#  the x axis is rating out of 5 and the y axis is the number of people in the photo, there can be any number of people found in the objects array
def plot_rating_vs_person(data):
    ratings = []
    people = []
    for product in data:
        if 'objects' in product['prediction']:
            ratings.append(float(product['product_star_rating']))
            people.append(float(product['person_count']))
        else:
            ratings.append(float(product['product_star_rating']))
            people.append(0)

    # Convert ratings and people to numpy arrays
    ratings = np.array(ratings)
    people = np.array(people)

    # Apply a log transformation to the ratings and people arrays
    # ratings = np.log1p(ratings)
    people = np.log1p(people)

    # round the transformed data to the nearest integer
    ratings = np.round(ratings)
    people = np.round(people)

    plot_heatmap(ratings, people, 'Rating',
                 'Number of People', 'Rating vs Number of People')

# here we create a heatmap of the number of ratings and the number of people in the photo
#  the x axis is the number of people in the photo and the y axis is the number of ratings


def plot_num_ratings_vs_person(data):
    ratings = []
    people = []
    max_ratings = 0
    max_people = 0
    for product in data:
        max_ratings = max(max_ratings, int(product['product_num_ratings']))

        if 'objects' in product['prediction']:
            max_people = max(max_people, int(product['person_count']))
            ratings.append(int(product['product_num_ratings']))
            people.append(int(product['person_count']))
        else:
            ratings.append(int(product['product_num_ratings']))
            people.append(0)

    # Convert ratings and people to numpy arrays
    ratings = np.array(ratings)
    people = np.array(people)

    ratings = np.log1p(ratings)
    people = np.log1p(people)

    # round the transformed data to the nearest integer
    ratings = np.round(ratings)
    people = np.round(people)

    plot_heatmap(ratings, people, 'Number of Ratings',
                 'Number of People', 'Number of Ratings vs Number of People')


def plot_heatmap(x, y, xlabel, ylabel, title):
    # Create bins for the x and y axis
    bin_y = np.arange(0, int(max(y)) + 1, 1)
    bin_x = np.arange(0, int(max(x)) + 1, 1)

    # Create a 2D density plot
    hist, xedges, yedges = np.histogram2d(x, y, bins=[bin_x, bin_y])

    plt.imshow(hist.T, origin='lower', interpolation='nearest',
               norm=colors.LogNorm(vmin=1, vmax=hist.max()), cmap='viridis')
    plt.colorbar()
    plt.axis('square')

    # Set the locator for x and y axis
    ax = plt.gca()

    # Add annotations
    for i in range(hist.T.shape[0]):
        for j in range(hist.T.shape[1]):
            plt.text(j, i, int(hist.T[i, j]), ha='center',
                     va='center', color='white')

    # make the x and y axis ticks integers starting from 1
    ax.xaxis.set_major_locator(ticker.MaxNLocator(integer=True))
    ax.yaxis.set_major_locator(ticker.MaxNLocator(integer=True))

    # set the ax background as black
    ax.set_facecolor('black')

    plt.xlabel(xlabel)
    plt.ylabel(ylabel)
    plt.title(title)


json_file = open('amazon_jewelry_with_prediction.json')
file_content = json.load(json_file)
json_file.close()

plt.figure(figsize=(10, 10))
plt.subplot(2, 2, 1)  # Create a subplot in a 2x2 grid at the 1st position
plot_num_ratings_vs_person(file_content)

plt.subplot(2, 2, 2)  # Create a subplot in a 2x2 grid at the 2nd position
plot_rating_vs_person(file_content)

plt.subplot(2, 2, 3)  # Create a subplot in a 2x2 grid at the 3rd position
plot_best_seller_vs_person(file_content)

plt.subplot(2, 2, 4)  # Create a subplot in a 2x2 grid at the 4th position
plot_volume_vs_person(file_content)

plt.show()
