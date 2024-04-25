import * as THREE from 'three';
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
        this.trafficFactor = 0.0;
        this.active = true;
    }

    updatePosition(time, newX, newY, newWidth, newHeight)
    {

        this.active = true;
        if (newX === this.x || newY === this.y)
        {
            return;
        }

        if (Math.abs(newX - this.x) > 100 || Math.abs(newY - this.y) > 100)
        {
            this.x = newX;
            this.y = newY;
            return;
        }

        this.width = newWidth;
        this.height = newHeight;
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
        // this.velocity.x = newVelocityX;
        // this.velocity.y = newVelocityY;
        this.velocity.x *= 6;
        this.velocity.y *= 6;
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
        const scalar = 1.8;
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

        for (let i = 1; i < this.accelerationTimes.length; i++)
        {

            const lastPosition = this.positions[ i - 1 ];
            const currentPosition = this.positions[ i ];
            const lastTime = this.accelerationTimes[ i - 1 ];
            const time = this.accelerationTimes[ i ];

            if (time - lastTime <= 1 && Math.abs(lastPosition.x - currentPosition.x) < 10 && Math.abs(lastPosition.y - currentPosition.y) < 10)
            {
                count += 1;
            }
        }

        return count;
    }

}

function findClosestVehicle(object, vehiclesMap, threshold = 100)
{

    if (!object.traceId) return null;

    let closestVehicle = vehiclesMap.get(object.traceId);

    return closestVehicle;
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

function getFlowStatistics()
{
    const allVelocities = [];
    for (const car of getVehicles(true).values())
    {
        let velocity = car.getVelocity();

        if (!velocity.x || !velocity.y) { continue; }

        allVelocities.push(new THREE.Vector2(-1 * velocity.x, velocity.y));
    }

    if (allVelocities.length < 2) return { flow1: { direction: new THREE.Vector2(0, 0), count: 0 }, flow2: { direction: new THREE.Vector2(0, 0), count: 0 } };

    const primaryDirections = findPrimaryDirections(allVelocities);

    const direction = {
        flow1:
        {
            direction: primaryDirections[ 0 ],
            count: 0
        },
        flow2:
        {
            direction: primaryDirections[ 1 ],
            count: 0
        },

    };

    for (const vel of allVelocities)
    {
        if (vel.angleTo(direction.flow1.direction) < Math.PI / 2)
        {
            direction.flow1.count += 1;
        } else
        {
            direction.flow2.count += 1;
        }
    }

    return direction;
}

function findPrimaryDirections(velocities)
{
    const numBuckets = 8; // You can adjust the number of buckets based on the granularity you need
    const buckets = new Array(numBuckets).fill().map(() => ({
        vectorSum: new THREE.Vector2(0, 0),
        count: 0
    }));

    // Distribute vectors into buckets based on their angle
    for (const velocity of velocities)
    {
        let angle = velocity.angle();

        const index = Math.floor(angle / (2 * Math.PI) * numBuckets);
        buckets[ index ].vectorSum.add(velocity);
        buckets[ index ].count += 1;
    }

    // Compute average direction for each bucket
    const directions = buckets
        .filter(bucket => bucket.count > 0) // Filter out empty buckets
        .map(bucket =>
        {
            const avgVector = bucket.vectorSum.clone().divideScalar(bucket.count);
            return avgVector.normalize();
        });

    // Sort directions by count
    directions.sort((a, b) => buckets[ directions.indexOf(b) ].count - buckets[ directions.indexOf(a) ].count);

    return [ directions[ 0 ], directions[ 0 ].clone().negate() ];
}

function detectCollision(vehicleMap)
{
    let collisionDetected = false;
    let trafficDetected = false;
    let vehiclesInTraffic = 0;
    for (const vehicle of vehicleMap.values())
    {
        // detect dynamic collision based on acceleration change
        const dynamicThreshold = vehicle.getDynamicAccelerationThreshold();
        const lastAcceleration = Math.abs(vehicle.accelerations[ vehicle.accelerations.length - 1 ] || 0);


        const sequentialAccelerationCount = vehicle.getSequentialAccelerationCount() >= 20;

        if (lastAcceleration > dynamicThreshold && sequentialAccelerationCount)
        {

            vehicle.collisionFactor = 1.0;
            // vehicle.clearAccelerations();

            collisionDetected = true;
        }


        // detect traffic congestion based on average velocity
        if (vehicle.velocities.length >= 5)
        {
            const velocities = vehicle.velocities.slice(vehicle.velocities.length - 5, vehicle.velocities.length);
            const averageVelocity = velocities.reduce((sum, vel) => sum + Math.sqrt(vel.x ** 2 + vel.y ** 2), 0) / velocities.length;

            if (averageVelocity < 20)
            {
                vehicle.trafficFactor = 1.0;
                vehiclesInTraffic += 1;
            } else
            {
                vehicle.trafficFactor = 0.0;
            }

        }
    }

    if (vehiclesInTraffic > 1)
    {
        trafficDetected = true;
    }

    return { traffic: trafficDetected, collision: collisionDetected };
}



function processFrame(frameData)
{
    if (!frameData) { return; }
    if (!frameData.objects) { return; }

    // mark all vehicles as inactive if they were not updated in the current frame
    for (const vehidle of vehicles.values())
    {
        if (vehidle.active)
        {
            vehidle.active = false;
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

            const closestCar = findClosestVehicle(object, vehicles);

            if (closestCar)
            {
                closestCar.updatePosition(frameData.seconds, object.x, object.y, object.width, object.height);
                vehicles.set(closestCar.id, closestCar);

            } else
            {

                const newId = object.traceId;
                if (!newId) continue;

                const newCar = new Car(newId, object.x, object.y, object.width, object.height);
                vehicles.set(newId, newCar);

            }

        }

    }


    return detectCollision(vehicles);
}

function getVehicles(allVehicles = false)
{
    if (allVehicles)
    {
        return vehicles;
    }

    // Return only active vehicles
    return Array.from(vehicles.values()).filter((car) => car.active);
}

export { processFrame, getVehicles, getFlowStatistics };
