import os
from eyepop import EyePopSdk

pop_uuid = "0718af53784840ebad5fc895c93c96ae"
api_key = "AAHiTQPKBjMQkKoM_T2VE7DeZ0FBQUFBQmx1dkpXNTBxV2YwV2hkS3BkWHJkRm1WNTltbDhZbVZXWklpOGduV3p1SUNZMWxkT1JfR2pDaVpsRGRyeERqbVRxX3hNMEREM1p4VDJtcWZBclMwMTBRTDBPUzdIOHRueW9GUjNnaDZnYVFTWGJRMDQ9"
token = ""


def main():

    endpoint = EyePopSdk.endpoint(
        # This is the default and can be omitted
        pop_id=pop_uuid, 
        # This is the default and can be omitted
        secret_key=api_key,
    )

    endpoint.connect()
    # do work ....
    endpoint.disconnect()
