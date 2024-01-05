import * as THREE from 'https://unpkg.com/three/build/three.module.js';

// a class that contains a map of all the people in the scene and their history of positions
import People from "../data/People.js";

export default class PeopleManager
{
    constructor(dimensions)
    {
        this.peopleMap = new Map();
        this.hotSpotMap = new Map();
        this.dimensions = dimensions;
        this.allPeoplePositions = [];
    }

    normalizePosition(position, sourceWidth, sourceHeight)
    {
        let normalizedX = position.x * (this.dimensions.width / sourceWidth);
        let normalizedY = position.y * (this.dimensions.height / sourceHeight);

        // now map the normalized position to -1 to 1
        normalizedX = (normalizedX / (this.dimensions.width / 2)) - 1;
        normalizedY = (normalizedY / (this.dimensions.height / 2)) - 1;

        normalizedX *= -1;
        normalizedY *= -1;

        return { x: normalizedX, y: normalizedY };
    }

    addPerson(person)
    {
        let cachedPerson = this.getPerson(person.traceId);

        if (!cachedPerson)
        {
            cachedPerson = new People();
        }

        if (!person.source_width || !person.source_height)
        {
            return cachedPerson;
        }

        // Flip the X, Y coordinates to match THREE.js

        let normalizedTopLeft = this.normalizePosition(person, person.source_width, person.source_height);

        cachedPerson.traceId = person.traceId;
        cachedPerson.pose = person.objects;

        // the top left position of the person
        cachedPerson.topLeftPoint.x = normalizedTopLeft.x;
        cachedPerson.topLeftPoint.y = normalizedTopLeft.y;

        let maxX = person.x + person.width;
        let maxY = person.y + person.height;

        const normalizedBottomRight = this.normalizePosition(
            { x: maxX, y: maxY },
            person.source_width,
            person.source_height
        );

        cachedPerson.bottomRightPoint.x = normalizedBottomRight.x;
        cachedPerson.bottomRightPoint.y = normalizedBottomRight.y;

        cachedPerson.bounds = new THREE.Box3();
        cachedPerson.bounds.min.x = normalizedTopLeft.x;
        cachedPerson.bounds.min.y = normalizedTopLeft.y;
        cachedPerson.bounds.max.x = normalizedBottomRight.x;
        cachedPerson.bounds.max.y = normalizedBottomRight.y;


        cachedPerson.position = new THREE.Vector3();
        cachedPerson.position.x = (normalizedTopLeft.x + normalizedBottomRight.x) / 2;
        cachedPerson.position.y = (normalizedTopLeft.y + normalizedBottomRight.y) / 2;

        cachedPerson.addPathPoint(cachedPerson.position);
        this.allPeoplePositions.push(cachedPerson.position);

        this.peopleMap.set(person.traceId, cachedPerson);

        return cachedPerson;

    }

    removePerson(traceID)
    {
        this.peopleMap.delete(traceID);
    }

    getPerson(traceID)
    {
        return this.peopleMap.get(traceID);
    }

    getPeople()
    {
        return this.peopleMap;
    }

    getPeopleArray()
    {
        return Array.from(this.peopleMap.values());
    }

    getPeoplePositions()
    {
        let positions = [];
        this.peopleMap.forEach((person) =>
        {
            positions.push(person.position);
        });
        return positions;
    }


}
