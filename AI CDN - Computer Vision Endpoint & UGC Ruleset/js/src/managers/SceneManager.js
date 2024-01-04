// a class that builds and manages adding meshes and moving them around
import * as THREE from 'https://unpkg.com/three/build/three.module.js';
import PeopleManager from './PeopleManager.js';
import People from '../data/People.js';

export default class SceneManager
{

    constructor(scene, camera, dimensions)
    {
        this.scene = scene;
        this.camera = camera;
        this.dimensions = dimensions;
        this.peopleManager = new PeopleManager(dimensions);
        this.activePeople = [];

        // Create an instanced mesh outside of the drawPoint function
        let instanceGeometry = new THREE.BoxGeometry(.1, .1, 1);
        let instanceMaterial = new THREE.MeshNormalMaterial({ color: 0xff0000 });
        instanceGeometry.computeVertexNormals();

        this.mockObject = new THREE.Object3D();
        this.instanceCount = 10000; // Set this to the maximum number of instances you expect to need
        this.instanceMesh = new THREE.InstancedMesh(instanceGeometry, instanceMaterial, this.instanceCount);

        console.log("this.instanceMesh: ", this.instanceMesh)
        // this.instanceMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.scene.add(this.instanceMesh);

    }

    update(frameData)
    {
        const previousActivePeople = [ ...this.activePeople ];
        this.activePeople = [];

        // console.log(frameData)
        for (let i = 0; i < frameData.objects.length; i++)
        {
            let objects = frameData.objects[ i ];
            if (objects.classLabel === "person")
            {
                const person = this.peopleManager.addPerson(objects);

                this.activePeople.push(person);

                this.drawPoint(person);
                this.drawBoundingBox(person);
            }
        }

        // hide people that are no longer in the scene
        for (let i = 0; i < previousActivePeople.length; i++)
        {
            const person = previousActivePeople[ i ];
            if (!this.activePeople.includes(person))
            {
                person.centerSphere && (person.centerSphere.visible = false);
                person.pathLine && (person.pathLine.visible = false);
                person.bounds && (person.bounds.visible = false);
            } else
            {
                person.centerSphere && (person.centerSphere.visible = true);
                person.pathLine && (person.pathLine.visible = true);
                person.bounds && (person.bounds.visible = true);
            }
        }


        this.drawPaths();
    }

    drawPoint(person)
    {
        if (!person) return;

        let sphere = person.centerSphere;

        if (!sphere)
        {
            let geometry = new THREE.SphereGeometry(0.015, 8, 8);
            let material = new THREE.MeshNormalMaterial();
            sphere = new THREE.Mesh(geometry, material);

            this.scene.add(sphere);
            person.centerSphere = sphere;

            sphere = person.centerSphere;
        }

        let point = person.position;
        sphere.position.x = point.y;
        sphere.position.y = point.x;
        sphere.position.z = 0;

    }


    drawPath(person)
    {
        let path = person.path;
        if (path.length < 4) return;

        let line = person.pathLine;

        const pathGeometry = new THREE.BufferGeometry().setFromPoints(path);
        if (!line)
        {
            const pathMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: .5, side: THREE.DoubleSide, wireframe: true });

            person.pathLine = new THREE.Mesh(pathGeometry, pathMaterial);

            this.scene.add(person.pathLine);
        }
        else 
        {
            person.pathLine.geometry.copy(pathGeometry);
        }
    }



    drawBoundingBox(person)
    {

        // draw a sphere at these positions: 
        //  person.position, person.position.x + person.size.x, person.position.y + person.size.y


        // let sphere = person.topLeft;

        // if (!sphere)
        // {
        //     let geometry = new THREE.BoxGeometry(0.025, 0.025, 0.025);
        //     let material = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5 });
        //     sphere = new THREE.Mesh(geometry, material);
        //     this.scene.add(sphere);
        //     person.midPoint = sphere;
        // }
        // let point = person.position;
        // sphere.position.x = point.y;
        // sphere.position.y = point.x;
        // sphere.position.z = 0;

    }

    drawPaths()
    {

        for (let i = 0; i < this.peopleManager.allPeoplePositions.length - 1; i++)
        {
            let point = this.peopleManager.allPeoplePositions[ i ];

            this.mockObject.position.set(point.x, point.y, 0);
            this.mockObject.updateMatrix();

            this.instanceMesh.setMatrixAt(i, this.mockObject.matrix);

            this.instanceMesh.instanceMatrix.needsUpdate = true;
        }

    }

}

