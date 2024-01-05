// a class that builds and manages adding meshes and moving them around
import * as THREE from 'https://unpkg.com/three/build/three.module.js';
import PeopleManager from './PeopleManager.js';

export default class SceneManager
{

    constructor(scene, camera, dimensions)
    {
        this.scene = scene;
        this.camera = camera;
        this.dimensions = dimensions;
        this.peopleManager = new PeopleManager(dimensions);
        this.activePeople = [];

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
                this.drawPath(person);
                this.drawBoundingBox(person);
                this.drawPose(person);
            }
        }

        this.hideInactivePeople(previousActivePeople);

    }

    hideInactivePeople(previousActivePeople)
    {
        // hide people that are no longer in the scene
        for (let i = 0; i < previousActivePeople.length; i++)
        {
            const person = previousActivePeople[ i ];
            if (!this.activePeople.includes(person))
            {
                person.centerSphere && (person.centerSphere.visible = false);
                person.pathLine && (person.pathLine.visible = false);
                person.boundsBox && (person.boundsBox.visible = false);
            } else
            {
                person.centerSphere && (person.centerSphere.visible = true);
                person.pathLine && (person.pathLine.visible = true);
                person.boundsBox && (person.boundsBox.visible = true);
            }
        }
    }

    drawPoint(person)
    {
        if (!person) return;

        let sphere = person.centerSphere;

        if (!sphere)
        {
            let geometry = new THREE.SphereGeometry(0.01, 8, 8);
            let material = new THREE.MeshBasicMaterial({ color: 0x00fa00, transparent: true, opacity: 0.8 });
            sphere = new THREE.Mesh(geometry, material);

            this.scene.add(sphere);
            person.centerSphere = sphere;

            sphere = person.centerSphere;
        }

        let point = person.position;
        sphere.position.x = point.x;
        sphere.position.y = point.y;
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
            const pathMaterial = new THREE.LineBasicMaterial({
                color: 0xfaa61a,
                linewidth: 10,
            });

            person.pathLine = new THREE.Line(pathGeometry, pathMaterial);

            this.scene.add(person.pathLine);
        }
        else 
        {
            line.geometry.copy(pathGeometry);
            line.geometry.verticesNeedUpdate = true;
        }
    }


    // TODO: Draw a sexier bounding box with a sprite or shader
    drawBoundingBox(person)
    {
        const bounds = person.bounds;
        if (!bounds) return;

        const boundsBox = person.boundsBox;

        let width = bounds.max.x - bounds.min.x;
        let height = bounds.max.y - bounds.min.y;

        const boxGeometry = new THREE.BoxGeometry(width, height, 0);
        const boxMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff, opacity: 0.5, transparent: true });
        const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);

        boxMesh.position.x = person.position.x;
        boxMesh.position.y = person.position.y;
        boxMesh.position.z = 0;

        if (!boundsBox)
        {
            this.scene.add(boxMesh);
            person.boundsBox = boxMesh;
        }
        else 
        {
            boundsBox.geometry = boxGeometry;
            boundsBox.material = boxMaterial;
            boundsBox.position.x = boxMesh.position.x;
            boundsBox.position.y = boxMesh.position.y;
            boundsBox.position.z = boxMesh.position.z;

            boundsBox.geometry.verticesNeedUpdate = true;
        }

    }


    drawPose(person)
    {
        const pose = person.pose;
    }

    //     var points = keyPoints.points
    //     var canvas2 = VideoPlayer.context.canvas
    //     var context = canvas2.getContext('2d')

    //     var labelPoints = []
    //     let fillColor = VideoPlayer.colors.primary_color;
    //     let max_z = 0;
    //     let min_z = 0;
    //     for (var i = 0; i < points.length; i++)
    //     {
    //         var p = { ...points[ i ] }
    //         //normalize point
    //         p.y_normalized = p.y / source_height
    //         p.x_normalized = p.x / source_width
    //         p.z_normalized = p.z / source_width

    //         p.y = p.y_normalized * VideoPlayer.instance.displayHeight
    //         p.x = p.x_normalized * VideoPlayer.instance.displayWidth
    //         p.z = p.z_normalized * VideoPlayer.instance.displayWidth

    //         if (p.z > max_z)
    //         {
    //             max_z = p.z;
    //         }
    //         if (p.z < min_z)
    //         {
    //             min_z = p.z;
    //         }

    //         labelPoints[ p.classLabel ] = p
    //     }

    //     var connections = [
    //         [ 'mouth (right)', 'mouth (left)' ],
    //         [ 'right ear', 'right eye (outer)' ],
    //         [ 'right eye (outer)', 'right eye' ],
    //         [ 'right eye', 'right eye (inner)' ],
    //         [ 'right eye (inner)', 'nose' ],
    //         [ 'nose', 'left eye (inner)' ],
    //         [ 'left eye (inner)', 'left eye' ],
    //         [ 'left eye', 'left eye (outer)' ],
    //         [ 'left eye (outer)', 'left ear' ],

    //         [ 'right shoulder', 'left shoulder' ],
    //         [ 'left shoulder', 'left hip' ],
    //         [ 'left hip', 'right hip' ],
    //         [ 'right hip', 'right shoulder' ],

    //         [ 'right shoulder', 'right elbow' ],
    //         [ 'right elbow', 'right wrist' ],
    //         [ 'right wrist', 'right thumb' ],
    //         [ 'right wrist', 'right pinky' ],
    //         [ 'right wrist', 'right index' ],
    //         [ 'right pinky', 'right index' ],

    //         [ 'left shoulder', 'left elbow' ],
    //         [ 'left elbow', 'left wrist' ],
    //         [ 'left wrist', 'left thumb' ],
    //         [ 'left wrist', 'left pinky' ],
    //         [ 'left wrist', 'left index' ],
    //         [ 'left pinky', 'left index' ],

    //         [ 'right hip', 'right knee' ],
    //         [ 'right knee', 'right ankle' ],
    //         [ 'right ankle', 'right foot index' ],
    //         [ 'right ankle', 'right heel' ],
    //         [ 'right heel', 'right foot index' ],

    //         [ 'left hip', 'left knee' ],
    //         [ 'left knee', 'left ankle' ],
    //         [ 'left ankle', 'left foot index' ],
    //         [ 'left ankle', 'left heel' ],
    //         [ 'left heel', 'left foot index' ],
    //     ]

    //     for (var i = 0; i < connections.length; i++)
    //     {
    //         var point1 = labelPoints[ connections[ i ][ 0 ] ]
    //         var point2 = labelPoints[ connections[ i ][ 1 ] ]

    //         if (!point1 || !point1.x) continue

    //         if (!point2 || !point2.x) continue

    //         context.beginPath()
    //         context.lineWidth = 3
    //         context.strokeStyle = VideoPlayer.colors.primary_color
    //         context.fillStyle = VideoPlayer.colors.primary_color
    //         context.moveTo(point1.x, point1.y)
    //         context.lineTo(point2.x, point2.y)
    //         context.stroke()
    //         context.closePath()
    //     }

    //     const MIN_RADIUS = 3;
    //     const MAX_RADIUS = pose.width / 30;

    //     for (let i = 0; i < points.length; i++)
    //     {
    //         let p = { ...points[ i ] }
    //         //normalize pointl
    //         p.y_normalized = p.y / source_height
    //         p.x_normalized = p.x / source_width
    //         p.z_normalized = p.z / source_width

    //         p.y = p.y_normalized * VideoPlayer.instance.displayHeight
    //         p.x = p.x_normalized * VideoPlayer.instance.displayWidth
    //         let radius = MAX_RADIUS - (p.z_normalized * VideoPlayer.instance.displayWidth - min_z) * (MAX_RADIUS - MIN_RADIUS) / (max_z - min_z)

    //         //draw circle
    //         context.beginPath()
    //         context.arc(p.x, p.y, radius, 0, Math.PI * 2, false)
    //         if (points[ i ].classLabel.includes('left'))
    //         {
    //             context.fillStyle = VideoPlayer.colors.left_color
    //         } else if (points[ i ].classLabel.includes('right'))
    //         {
    //             context.fillStyle = VideoPlayer.colors.right_color
    //         } else
    //         {
    //             context.fillStyle = fillColor
    //         }
    //         context.fill()
    //         context.strokeStyle = VideoPlayer.colors.secondary_color
    //         context.stroke()
    //         labelPoints[ p.classLabel ] = p
    //     }
    // }

    // }


}

