// a class that contains a map of all the people in the scene and their history of positions
import People from "../data/People.js";

export default class PeopleManager
{
    constructor()
    {
        this.peopleMap = new Map();
        this.hotSpotMap = new Map();
    }

    normalizePosition(position, width, height, sourceWidth, sourceHeight)
    {
        let normalizedX = position.x * (width / sourceWidth);
        let normalizedY = position.y * (height / sourceHeight);

        // now map the normalized position to -1 to 1
        normalizedX = (normalizedX / (width / 2)) - 1;
        normalizedY = (normalizedY / (height / 2)) - 1;
        // normalizedX *= -1;
        // normalizedY *= -1;

        if (!normalizedX)
        {
            debugger;
        }

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

        let normalizedPosition = this.normalizePosition(person, person.width, person.height, person.source_width, person.source_height);

        cachedPerson.traceId = person.traceId;
        cachedPerson.pose = person.objects;
        cachedPerson.position.x = normalizedPosition.x;
        cachedPerson.position.y = normalizedPosition.y;

        if (person.objects && person.objects.length > 0 && person.objects[ 0 ].outline && person.objects[ 0 ].outline.length > 0)
        {

            let boundPoint1 = this.normalizePosition(person.objects[ 0 ].outline[ 0 ], person.width, person.height, person.source_width, person.source_height);
            let boundPoint2 = this.normalizePosition(person.objects[ 0 ].outline[ 1 ], person.width, person.height, person.source_width, person.source_height);
            let boundPoint3 = this.normalizePosition(person.objects[ 0 ].outline[ 2 ], person.width, person.height, person.source_width, person.source_height);
            let boundPoint4 = this.normalizePosition(person.objects[ 0 ].outline[ 3 ], person.width, person.height, person.source_width, person.source_height);

            cachedPerson.boundingBox.min.x = boundPoint1.x;
            cachedPerson.boundingBox.min.y = boundPoint1.y;
            cachedPerson.boundingBox.max.x = boundPoint4.x;
            cachedPerson.boundingBox.max.y = boundPoint4.y;
        }

        cachedPerson.path.push(cachedPerson.position);

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
