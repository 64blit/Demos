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
    }

    update(frameData)
    {
        // console.log(frameData)
        for (let i = 0; i < frameData.objects.length; i++)
        {
            let objects = frameData.objects[ i ];
            if (objects.classLabel === "person")
            {
                // console.log("person: ", objects);
                const person = this.peopleManager.addPerson(objects);
                this.drawPoint(person);
                // this.drawBoundingBox(person);
                this.drawPath(person);
            }


        }

    }

    drawPoint(person)
    {
        if (!person) return;

        let sphere = person.midPoint;

        if (!sphere)
        {
            let geometry = new THREE.SphereGeometry(0.025, 32, 32);
            let material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
            sphere = new THREE.Mesh(geometry, material);
            this.scene.add(sphere);
            person.midPoint = sphere;
            this.scene.add(sphere);
        }
        let point = person.position;
        sphere.position.x = point.y;
        sphere.position.y = point.x;
        sphere.position.z = 0;
    }

    drawPath(person)
    {
        let line = person.line;


        let path = person.path;
        let geometry = new THREE.BufferGeometry().setFromPoints(path);
        let material = new THREE.LineBasicMaterial({ color: 0xff0000 });

        if (!line)
        {
            line = new THREE.Line(geometry, material);
            this.scene.add(line);
        }

        line.material = material;
        line.geometry = geometry;
    }

    drawBoundingBox(person)
    {
        let cube = person.bounds;

        let boundingBox = person.boundingBox;
        let geometry = new THREE.BoxGeometry(boundingBox.max.x - boundingBox.min.x, boundingBox.max.y - boundingBox.min.y, boundingBox.max.z - boundingBox.min.z);
        let material = new THREE.MeshBasicMaterial({ color: 0x00ff00, opacity: 0.5 });

        if (!cube)
        {
            cube = new THREE.Mesh(geometry, material);
            person.bounds = cube;
            this.scene.add(cube);
        }

        cube.geometry = geometry;


    }

}

