import asyncio
from eyepop import EyePopSdk
from eyepop import Job
import json


POP_UUID, POP_API_SECRET = '', ''

with open("../config") as file:
    data = file.readlines()
    POP_UUID = data[0].strip().split("=")[1]
    POP_API_SECRET = data[1].strip().split("=")[1]

async def async_upload_photos(file_paths: list[str]):
    predictions = {}

    async def on_ready(job: Job):
        print(f"Prediction ready for {job.location}")
        prediction = await job.predict()
        predictions[job.location] = prediction

    async with EyePopSdk.endpoint(pop_id=POP_UUID, secret_key=POP_API_SECRET, is_async=True) as endpoint:
        for file_path in file_paths:
            await endpoint.upload(file_path, on_ready)

    with open('predictions.json', 'w') as file:
        json.dump(predictions, file)

asyncio.run(async_upload_photos(['images\photo_for_demo3.jpeg'] * 10))
