// a class that manages the prediction data with helpers to get the people at a certain time and to build the meshes around them

export default class PredictionDataManager
{
    constructor(frameData = [])
    {
        this.frameData = frameData;
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

    getClosestFrame(time)
    {
        let closestFrame = null;
        let closestTime = null;
        this.frameData.forEach((frame) =>
        {
            let frameTime = frame.time;
            if (closestTime === null || Math.abs(frameTime - time) < Math.abs(closestTime - time))
            {
                closestFrame = frame;
                closestTime = frameTime;
            }
        });
        return closestFrame;
    }

}
