var vehicles = new Map();


class Car
{
    constructor(id, x, y, width, height)
    {
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.positions = [];
        this.velocity = { x: 0, y: 0 };
        this.velocities = [];
        this.accelerations = [];
        this.accelerationTimes = [];
        this.collisionFactor = 0.0;
        this.active = true;
        this.arrow = null;
    }

    updatePosition(time, newX, newY, newWidth, newHeight)
    {
        this.width = newWidth;
        this.height = newHeight;
        this.active = true;
        this.positions.push({ x: newX, y: newY });

        // Calculate new velocity
        const newVelocityX = newX - this.x;
        const newVelocityY = newY - this.y;
        const newSpeed = Math.sqrt(newVelocityX ** 2 + newVelocityY ** 2);

        // Calculate acceleration based on the change in speed over one frame
        const oldSpeed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
        const acceleration = newSpeed - oldSpeed; // Assuming a constant frame rate

        // Update position and velocity using the average of the positions
        this.x = newX;
        this.y = newY;

        // Update acceleration history, maintaining a fixed size of history
        if (this.accelerations.length >= 40)
        {
            this.accelerations.shift();
            this.accelerationTimes.shift();
            this.positions.shift();
            this.velocities.shift();
        }

        this.velocities.push({ x: newVelocityX, y: newVelocityY });
        this.accelerationTimes.push(time);
        this.accelerations.push(acceleration);

        this.velocity.x = this.velocities.reduce((sum, vel) => sum + vel.x, 0) / this.velocities.length;
        this.velocity.y = this.velocities.reduce((sum, vel) => sum + vel.y, 0) / this.velocities.length;
        this.velocity.x *= 2;
        this.velocity.y *= 2;
    }

    getVelocity()
    {
        return {
            x: this.velocities.reduce((sum, vel) => sum + vel.x, 0) / this.velocities.length,
            y: this.velocities.reduce((sum, vel) => sum + vel.y, 0) / this.velocities.length
        };
    }

    getDynamicAccelerationThreshold()
    {
        if (this.accelerations.length < 2) { return 10; } // Default threshold if not enough data

        // Calculate mean of accelerations
        const mean = this.accelerations.reduce((a, b) => a + b) / this.accelerations.length;

        // Calculate standard deviation of accelerations
        const variance = this.accelerations.reduce((sum, acc) => sum + (acc - mean) ** 2, 0) / this.accelerations.length;
        const stdDeviation = Math.sqrt(variance);
        const scalar = 1.3;
        const threshold = (Math.abs(mean) + 2 * stdDeviation) * scalar;

        return threshold; // Can adjust the factor based on sensitivity needed
    }

    clearAccelerations()
    {
        this.accelerations = [];
        this.accelerationTimes = [];
    }

    getSequentialAccelerationCount()
    {
        let count = 0;
        let lastTime = -1;

        for (const time of this.accelerationTimes)
        {
            if (time - lastTime <= 1)
            {
                count += 1;
            }
            lastTime = time;
        }

        return count;
    }

}

function findClosestCar(x, y, carMap, threshold = 100)
{

    let closestCar = null;
    let closestDistance = Infinity;

    for (const car of carMap.values())
    {
        const distance = Math.sqrt((car.x - x) ** 2 + (car.y - y) ** 2);
        if (distance < closestDistance && distance <= threshold)
        {
            closestCar = car;
            closestDistance = distance;
        }
    }

    return closestCar;

}

function generateUniqueId()
{
    let newId;
    do
    {
        newId = Math.random().toString(36).slice(0, 9);
    } while (vehicles.has(newId));
    return newId;
}

function detectCollision(carMap)
{
    for (const car of carMap.values())
    {
        const dynamicThreshold = car.getDynamicAccelerationThreshold();
        const lastAcceleration = Math.abs(car.accelerations[ car.accelerations.length - 1 ] || 0);

        const sequentialAccelerationCount = car.getSequentialAccelerationCount();

        if (lastAcceleration > 1)
        {
            console.log('Car:', car.id, 'Last acceleration:', lastAcceleration, 'Threshold:', dynamicThreshold);
        }

        if (lastAcceleration > dynamicThreshold && sequentialAccelerationCount >= 2)
        {

            car.collisionFactor = 1.0;

            car.clearAccelerations();

            return true;

        }
    }

    return false;
}



function processFrame(frameData)
{
    if (!frameData) { return; }
    if (!frameData.objects) { return; }

    console.log(frameData);

    // mark all vehicles as inactive if they were not updated in the current frame
    for (const vehidle of vehicles.values())
    {
        if (vehidle.active)
        {
            vehidle.active = false;
            vehidle.collisionFactor = 0.0;
        }
    }

    for (const object of frameData.objects)
    {

        if (
            object.classLabel === 'car' ||
            object.classLabel === 'motorcycle' ||
            object.classLabel === 'bus' ||
            object.classLabel === 'truck'
        )
        {

            const closestCar = findClosestCar(object.x, object.y, vehicles);
            if (closestCar)
            {
                closestCar.updatePosition(frameData.seconds, object.x, object.y, object.width, object.height);
                vehicles.set(closestCar.id, closestCar);

            } else
            {

                const newId = generateUniqueId();
                const newCar = new Car(newId, object.x, object.y, object.width, object.height);
                vehicles.set(newId, newCar);

            }

        }

    }


    return detectCollision(vehicles);
}

function getVehicles()
{
    // return Array.from(vehicles.values());
    // return all active vehicles
    return Array.from(vehicles.values()).filter((car) => car.active);
}

export { processFrame, getVehicles };
