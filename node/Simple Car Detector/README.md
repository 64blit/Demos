# Simple EyePop.ai Counter

This guide will help you get the Simple EyePop.ai Counter code running on your local machine.

## Steps

1. **Run a Local Server**

    - Using Python:
        ```bash
        cd <directory containing eyepop_counter.html>
        python -m http.server 8000
        ```

2. **Open the HTML File**

    Open your web browser and navigate to `http://localhost:8000/eyepop_counter.html`.

    - Ensure you have a valid `popId` and `secretKey` for the EyePop endpoint in the `eyepop_counter.html` file. You can get these from the EyePop dashboard. Ensure a model such as People + Common Objects or Vehicles is selected on your Pop.

3. **Select a Video File**
    -  Click on the "1. Select a video file" input and choose a video file.
    -  Click twice on the canvas to draw a line for counting objects.

4. **View Results**

    - The video will play and loop on the canvas.
    - Bounding boxes and other visual elements will be drawn on the canvas.
    - The count will be displayed in the top-right corner of the canvas.


## Troubleshooting

- If the video does not load, check the console for errors.
- Ensure your video file is in a supported format.
- Verify your `popId` and `secretKey` are correct.
