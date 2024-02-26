from eyepop import EyePopSdk, Job
import json
import webbrowser

POP_UUID, POP_API_SECRET = '', ''

with open("../config") as file:
    data = file.readlines()
    POP_UUID = data[0].strip().split("=")[1]
    POP_API_SECRET = data[1].strip().split("=")[1]

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
