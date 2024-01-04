// a class that manages the prediction data with helpers to get the people at a certain time and to build the meshes around them

export default class PredictionDataManager
{
    constructor(frameData = [])
    {
        this.frameData = frameData;
        this.currentFrame = null;
    }

    setFrameData(frameData)
    {
        this.frameData = frameData;
    }

    pushFrameData(frameData)
    {
        this.frameData.push(frameData);
    }

    getFrameData()
    {
        return this.frameData;
    }

    getCurrentFrame()
    {
        return this.currentFrame;
    }

    getCurrentFrameTime()
    {
        return this.currentFrame.timestamp;
    }

    setCurrentFrame(time)
    {
        let closestFrame = null;
        let closestTime = null;
        this.frameData.forEach((frame) =>
        {
            let frameTime = frame.timestamp;
            if (closestTime === null || Math.abs(frameTime - time) < Math.abs(closestTime - time))
            {
                closestFrame = frame;
                closestTime = frameTime;
            }
        });
        this.currentFrame = closestFrame;

        return closestFrame;
    }

}
