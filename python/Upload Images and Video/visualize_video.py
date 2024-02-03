import cv2
import matplotlib.pyplot as plt
import matplotlib.animation as animation
import tkinter as tk
from tkinter import filedialog
import ctypes
from tkinter import ttk
from eyepop import EyePopSdk
import logging
import time 


POP_UUID = """YOUR POP UUID"""
POP_API_KEY = """YOUR POP API KEY"""


logging.basicConfig(level=logging.INFO)
logging.getLogger('eyepop').setLevel(level=logging.DEBUG)


def play_video(video_frames):
    """
    Plays the video frames along with their predictions.
    
    This function takes a dictionary of video frames and their predictions as input. It plots each frame
    along with its corresponding prediction using a video player.
    """

    print("Playing video...")

    # Create a figure and axis for the plot
    fig, ax = plt.subplots()

    # Disable axis labels and ticks
    ax.axis('off')

    # Create an initial plot with the first frame
    first_time = list(video_frames.keys())[1]
    im = ax.imshow(video_frames[first_time].frame)

    plot = EyePopSdk.plot(ax)
    
    def update(frame_time):
        """
        Update the plot with the new frame and prediction.
        
        This function is called for each frame of the video. It updates the plot with the new frame
        and its corresponding prediction.
        """

        # Update the plot with the new frame
        im.set_array(video_frames[frame_time].frame)
        # plot.prediction(video_frames[frame_time].prediction)

        return im,

    # Create an animation object
    ani = animation.FuncAnimation(fig, update, frames=video_frames.keys(), interval=10, blit=True)

    # Show the plot
    plt.show()


def upload_and_plot():
    """
    Uploads a video file, processes it using EyePopSdk, and plots the frames with predictions.
    
    This function prompts the user to select a video file using a file dialog. It then loads the frames of the video
    using OpenCV's VideoCapture. The frames are processed using EyePopSdk by uploading the video file and making
    predictions on each frame. The frames along with their predictions are stored in a dictionary. Finally, the
    video frames are plotted using the play_video function.
    """

    file_path = filedialog.askopenfilename()

    if not file_path:
        return
    
    video_frames = {}

    # Load the frames of the video
    cap = cv2.VideoCapture(file_path)

    with EyePopSdk.endpoint(pop_id=POP_UUID, secret_key=POP_API_KEY) as endpoint:
        
        job = endpoint.upload(file_path)

        print("Starting video processing... ", time.time())
        predictions = []
        while result := job.predict():
            predictions.append(result)
        # while True:
            print("Getting prediction data... ", time.time())

            ret, frame = cap.read()
            
            # if not ret:
            #     continue

            time = cap.get(cv2.CAP_PROP_POS_MSEC) / 1000

            # get the closest prediction to the current time based on prediction.seconds attribute
            result = min(predictions, key=lambda x: abs(x.seconds - time))

            frame_data = {
                'frame': cv2.cvtColor(frame, cv2.COLOR_BGR2RGB),
                'prediction': result
            }

            video_frames[time] = frame_data
            print(f"Loading video frames at {time}...")

    cap.release()

    play_video(video_frames)


def main():
    # Set DPI scaling
    ctypes.windll.shcore.SetProcessDpiAwareness(1)

    root = tk.Tk()
    root.title("Video Upload and Plot")
    screen_width = root.winfo_screenwidth()
    screen_height = root.winfo_screenheight()

    width_percentage = 15
    height_percentage = 10

    width = int(screen_width * width_percentage / 100)
    height = int(screen_height * height_percentage / 100)

    root.geometry(f"{width}x{height}")
    
    button = tk.Button(root, text="Select Video File", command=upload_and_plot)
    button.pack(pady=50)

    root.mainloop()


main()
