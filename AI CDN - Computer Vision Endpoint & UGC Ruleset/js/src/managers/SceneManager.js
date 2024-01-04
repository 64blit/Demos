// a class that builds and manages adding meshes and moving them around
import * as THREE from 'https://unpkg.com/three/build/three.module.js';
import PeopleManager from './PeopleManager.js';
import People from '../data/People.js';

export default class SceneManager
{

    constructor(scene, camera)
    {
        this.scene = scene;
        this.camera = camera;
        this.people = [];
        this.peopleManager = new PeopleManager();

        //create a sphere at 0,0,0 to see if the scene is working
        let geometry = new THREE.SphereGeometry(0.1, 32, 32);
        let material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        let sphere = new THREE.Mesh(geometry, material);
        sphere.position.x = -1;
        sphere.position.y = 1;
        sphere.position.z = 0;
        this.scene.add(sphere);

    }

    update(frameData)
    {
        console.log(frameData)
        for (let i = 0; i < frameData.objects.length; i++)
        {
            let objects = frameData.objects[ i ];
            if (objects.classLabel === "person")
            {
                // console.log("person: ", objects);
                const person = this.peopleManager.addPerson(objects);
                this.drawPoint(person);
                console.log(person)
            }


        }
    }

    drawPoint(person)
    {
        let point = person.position;
        let geometry = new THREE.SphereGeometry(0.1, 32, 32);
        let material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        let sphere = new THREE.Mesh(geometry, material);
        sphere.position.x = point.x;
        sphere.position.y = point.y;
        sphere.position.z = 0;
        this.scene.add(sphere);
    }

    drawPath(person)
    {
        let path = person.path;
        let geometry = new THREE.BufferGeometry().setFromPoints(path);
        let material = new THREE.LineBasicMaterial({ color: 0xff0000 });
        let line = new THREE.Line(geometry, material);

        if (!person.line)
        {
            this.scene.add(line);
            person.line = line;
        }
    }

}

