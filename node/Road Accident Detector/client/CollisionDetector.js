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
        if (this.accelerations.length >= 20)
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

function findClosestVehicle(x, y, vehiclesMap, threshold = 100)
{

    let closestVehicle = null;
    let closestDistance = Infinity;

    for (const vehicle of vehiclesMap.values())
    {
        const distance = Math.sqrt((vehicle.x - x) ** 2 + (vehicle.y - y) ** 2);
        if (distance < closestDistance && distance <= threshold)
        {
            closestVehicle = vehicle;
            closestDistance = distance;
        }
    }

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

// a function to detect and count the flow of vehicles in opposing directions
//  based on the velocity of the vehicles
function getFlowStatistics()
{
    const flowCount = {
        'flow1': { direction: new THREE.Vector2(), velocities: [], count: 0 },
        'flow2': { direction: new THREE.Vector2(), velocities: [], count: 0 }
    };

    // loop over all vehicles and average their velocities
    //  together into flow1, skipping all velocities which are not closer than a  
    //  threshold to flow1. If the velocity is closer to flow2, we add it to
    //  flow2 instead.
    for (const car of getVehicles(true).values())
    {
        let velocity = car.getVelocity();

        if (!velocity.x || !velocity.y) { continue; }

        velocity = new THREE.Vector2(-1 * velocity.x, velocity.y);

        velocity.normalize();

        if (flowCount.flow1.direction.angleTo(velocity) <= Math.PI / 2)
        {

            flowCount.flow1.direction.lerp(velocity, 0.5);
            flowCount.flow1.velocities.push(velocity);
            flowCount.flow1.count += 1;

        } else
        {

            flowCount.flow2.direction.lerp(velocity, 0.5);
            flowCount.flow2.velocities.push(velocity);
            flowCount.flow2.count += 1;

        }
    }


    flowCount.flow1.direction.rotateAround(new THREE.Vector2(0, 0), Math.PI);
    flowCount.flow2.direction.rotateAround(new THREE.Vector2(0, 0), Math.PI);

    flowCount.flow1.direction.normalize();
    flowCount.flow2.direction.normalize();

    // rotate the flow directions by 180 degrees to get the opposing flow direction

    return flowCount;
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

        const sequentialAccelerationCount = vehicle.getSequentialAccelerationCount();

        if (lastAcceleration > dynamicThreshold && sequentialAccelerationCount >= 2)
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

            const closestCar = findClosestVehicle(object.x, object.y, vehicles);

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
