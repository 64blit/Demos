from eyepop import EyePopSdk, Job
import json
import webbrowser
import sys

POP_UUID, POP_API_SECRET = 'e4fd9369a9de42f6becfb90e11f4620c', 'AAFWTEvZaWw-h40Bga2N9swqZ0FBQUFBQmwyU3JzOXNSblFFaWZVR2R4aEpyY0hlSmVDRzJOUFJsUE9QQ0lUUkI2YURpYXFPYWF5emQxdkc1ekplc3JMcW45T3JHN1VzTnlBUHp3NDJJeVlvcHg0UHFxOVUzWS1tR25GZ3V3eXZZMy0zcmlHT009'

# try:
#     with open("../config") as file:
#         data = file.readlines()
#         POP_UUID = data[0].strip().split("=")[1]
#         POP_API_SECRET = data[1].strip().split("=")[1]
# catch Exception as e:
#     print("Error reading config file", e)

endpoint = EyePopSdk.endpoint(
    pop_id=POP_UUID, secret_key=POP_API_SECRET, auto_start=True)

endpoint.connect()


def predict(url):

    return endpoint.load_from(url).predict()


json_file = open('amazon_jewelry.json')
file_content = json.load(json_file)
json_file.close()

person_counter = 0
for product in file_content:
    prediction = predict(product['product_photo'])
    product['prediction'] = prediction
    has_person = False

    if 'objects' not in prediction:
        continue

    if product['product_photo'] == 'https://m.media-amazon.com/images/I/71r7eWuCsaL._AC_SR525,789_FMwebp_QL65_.jpg':
        print("Prediction for product with photo: ", prediction)

    prediction_person_object_count = 0
    for obj in prediction['objects']:
        if obj['classLabel'] == 'person':
            has_person = True
            person_counter += 1
            prediction_person_object_count += 1
            print("Person found in ",
                  product['asin'], " with configdence ", obj['confidence'], " and person count ", prediction_person_object_count)

    product['person_count'] = prediction_person_object_count

    if has_person:
        webbrowser.open(product['product_photo'] +
                        "?confidence=" + str(obj['confidence']) + "&personCount=" + str(product['person_count']))

print("Total number of products with a person in the photo is:",
      person_counter, "out of", len(file_content), "products.")
with open('amazon_jewelry_with_prediction.json', 'w') as f:
    f.write(json.dumps(file_content, indent=4))

endpoint.disconnect()
