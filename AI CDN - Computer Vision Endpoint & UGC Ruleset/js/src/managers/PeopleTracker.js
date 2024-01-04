// a class that contains a map of all the people in the scene and their history of positions

export default class PeopleTracker
{
    constructor()
    {
        this.peopleMap = new Map();
        this.hotSpotMap = new Map();
    }

    addPerson(person)
    {
        this.peopleMap.set(person.traceID, person);
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
