import os
from eyepop import EyePopSdk
from PIL import Image
import matplotlib.pyplot as plt
from eyepop import EyePopSdk


pop_uuid = "0718af53784840ebad5fc895c93c96ae"
pop_api_key = "AAHiTQPKBjMQkKoM_T2VE7DeZ0FBQUFBQmx1dkpXNTBxV2YwV2hkS3BkWHJkRm1WNTltbDhZbVZXWklpOGduV3p1SUNZMWxkT1JfR2pDaVpsRGRyeERqbVRxX3hNMEREM1p4VDJtcWZBclMwMTBRTDBPUzdIOHRueW9GUjNnaDZnYVFTWGJRMDQ9"
pop_token = """eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InZUdzF6bi02cjFPcXg0NmNxRl9PMiJ9.eyJlbWFpbCI6ImVkbXVuZGR
hb0BnbWFpbC5jb20iLCJodHRwczovL2NsYWltcy5leWVwb3AuYWkvZ3JhbnRzIjpbeyJwZXJtaXNzaW9uIjoiYWNjZXNzOmluZmVyZW5jZS1hcGkiLCJ0YXJnZXQiOiJ1c2VyOmF1dGgwfDY1YWVhYmExNTBkMzk1YTNjODA2OGVlZSJ9XSwiaXNzIjoiaHR0cHM6Ly
9kZXYtZXllcG9wLnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHw2NWFlYWJhMTUwZDM5NWEzYzgwNjhlZWUiLCJhdWQiOlsiaHR0cHM6Ly9kZXYtYXBwLmV5ZXBvcC5haSIsImh0dHBzOi8vZGV2LWV5ZXBvcC51cy5hdXRoMC5jb20vdXNlcmluZm8iXSwiaWF0I
joxNzA2NzQ0MTE3LCJleHAiOjE3MDY4MzA1MTcsImF6cCI6IklVdDBwczJtYVdaVWRFbUVPUFJhUEpLdmtRVHM2WVVFIiwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCIsInBlcm1pc3Npb25zIjpbXX0.gGnmMbCVHvyoUT3dzhFvoAiWDL5wJw2fgLV1HqXs
WhZP8Se5cgIQF6SXK7ldqRw0JCvbyBNdcCm8fDz0zcSDg7tOld0guteZEZQ34cMobD9fxm-bcGa_rR6J2H-78DooVbnaucy-IjLPbK0iVcoNE91ATAnqTEosM_t_X6jHRn9NFdmCocFiHIbOl65vfqoin5tjg5t_aKarl1_pKK6kYqhSeryO6Gz6x9f87S0tcloyJLL
DLBCuBTEsT2Akt7lImQU4hZ3RVL3JkvXGHWcyE0EbN7Quj7JJVb2Xt-v90wgdv97_LHduPLUpCLbBwQsWcmNqiUXhzs_BT1I4rAd69g"""

image_path = "../HTTP Request & matplotlib/test_images/morgan-freeman.jpeg"

def main():

    endpoint = EyePopSdk.endpoint(
        # This is the default and can be omitted
        pop_id=pop_uuid, 
        # This is the default and can be omitted
        secret_key=pop_api_key,
    )

    endpoint.connect()
    # do work ....
    endpoint.disconnect()

    
with EyePopSdk.endpoint() as endpoint:
    result = endpoint.upload('examples/example.jpg').predict()
with Image.open('examples/example.jpg') as image:
    plt.imshow(image)
plot = EyePopSdk.plot(plt.gca())
plot.prediction(result)    
plt.show()
