import asyncio
from eyepop import EyePopSdk, Job
from EyePopPlot import EyePopPlot

import numpy as np
import cv2
from mss import mss
import time
import os
import threading

POP_UUID = "ce5befb6fbb943178a8a495ab1b0a910"

POP_API_SDK = """AAEzPwv0yF5H8UUgYcqbPxodZ0FBQUFBQmx2RG1BUXdBcVRjSlBGX1RRRXNTSF9JT3Q3QXp0eW03U0xhX2lmSThuMGlOUV9JN0p5cC02d281YXZFUnVadW5pd3Q5YTJ3ZHVnM0VMcjlJV3dfNVNlWXlPWHFNSFF2WEV4c0c5ek1OaWN5cXpDLWM9"""


class ScreenMonitorPop:

    def __init__(self, monitor_id):

        self.sct = mss()
        self.monitor = self.sct.monitors[monitor_id]

        self.result = None
        self.frame = None
        self.ep_cv2_plotter = None

    def draw_results(self,):
        if self.result is None:
            return self.frame
        
        if "objects" not in self.result:
            return self.frame

        self.ep_cv2_plotter = EyePopPlot(self.frame)

        for obj in self.result['objects']:
            self.ep_cv2_plotter.object(obj)
        
        # Blend the original frame and the frame with objects
        blended_frame = cv2.addWeighted(self.frame, 0.5, self.ep_cv2_plotter.frame, 0.5, 0)

        return blended_frame

    def capture_screen(self):
        # get the screen shot of the monitor and convert it to a numpy array
        self.frame = self.sct.grab(self.monitor)
        self.frame = np.array(self.frame)

    def get_prediction_results(self, endpoint):
        cv2.imwrite('temp.png', self.frame)
        self.result = endpoint.upload('temp.png').predict()

    def run(self):
        
        with EyePopSdk.endpoint(pop_id=POP_UUID, secret_key=POP_API_SDK) as endpoint:

            # infinite loop to capture the screen and send to EyePop API
            while True:
            
                self.capture_screen()

                # if the e key is pressed, upload the image to EyePop API
                if cv2.waitKey(1) & 0xFF == ord(' ') :
                    self.get_prediction_results(endpoint)

                drawing = self.draw_results()
                cv2.imshow('screencap', drawing)
        
                # if the q key is pressed, break the loop and close the window
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break

screenMonitorPop = ScreenMonitorPop(2)

try:
    screenMonitorPop.run()
finally:
    screenMonitorPop.sct.close()
    cv2.destroyAllWindows()
