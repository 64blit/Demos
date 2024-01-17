import * as THREE from 'https://unpkg.com/three/build/three.module.js';
import * as BufferGeometryUtils from 'https://unpkg.com/three/examples/jsm/utils/BufferGeometryUtils.js';
import { GLTFLoader } from 'https://unpkg.com/three/examples/jsm/loaders/GLTFLoader.js';

// a class that contains a map of all the people in the scene and their history of positions
import People from "../data/People.js";

export default class PeopleManager
{
    constructor(dimensions)
    {
        this.peopleMap = new Map();
        this.hotSpotMap = new Map();
        this.dimensions = dimensions;

        this.maxPeoplePositions = 50000;
        this.allPeoplePositions = [];

        this.edgesLoaded = false;
        this.edgeObjects = { topLeft: null, topRight: null, bottomLeft: null, bottomRight: null };

        this.loadEdgeObjects();

        this.poseConnections33 = [
            [ 'mouth (right)', 'mouth (left)' ],
            [ 'right ear', 'right eye (outer)' ],
            [ 'right eye (outer)', 'right eye' ],
            [ 'right eye', 'right eye (inner)' ],
            [ 'right eye (inner)', 'nose' ],
            [ 'nose', 'left eye (inner)' ],
            [ 'left eye (inner)', 'left eye' ],
            [ 'left eye', 'left eye (outer)' ],
            [ 'left eye (outer)', 'left ear' ],

            [ 'right shoulder', 'left shoulder' ],
            [ 'left shoulder', 'left hip' ],
            [ 'left hip', 'right hip' ],
            [ 'right hip', 'right shoulder' ],

            [ 'right shoulder', 'right elbow' ],
            [ 'right elbow', 'right wrist' ],
            [ 'right wrist', 'right thumb' ],
            [ 'right wrist', 'right pinky' ],
            [ 'right wrist', 'right index' ],
            [ 'right pinky', 'right index' ],

            [ 'left shoulder', 'left elbow' ],
            [ 'left elbow', 'left wrist' ],
            [ 'left wrist', 'left thumb' ],
            [ 'left wrist', 'left pinky' ],
            [ 'left wrist', 'left index' ],
            [ 'left pinky', 'left index' ],

            [ 'right hip', 'right knee' ],
            [ 'right knee', 'right ankle' ],
            [ 'right ankle', 'right foot index' ],
            [ 'right ankle', 'right heel' ],
            [ 'right heel', 'right foot index' ],

            [ 'left hip', 'left knee' ],
            [ 'left knee', 'left ankle' ],
            [ 'left ankle', 'left foot index' ],
            [ 'left ankle', 'left heel' ],
            [ 'left heel', 'left foot index' ],
        ]
    }

    loadEdgeObjects()
    {
        const scope = this;
        const loader = new GLTFLoader();
        loader.load('../utils/assets/edges.glb', (gltf) =>
        {
            const cornerMaterial = new THREE.MeshBasicMaterial({ transparent: true, side: THREE.DoubleSide, reflectivity: 0, fog: false, blending: THREE.MixOperation });

            gltf.scene.traverse((child) =>
            {
                if (child.isMesh)
                {

                    cornerMaterial.map = child.material.map;
                    child.material = cornerMaterial;
                    child.rotation.y = Math.PI / 2;

                    switch (child.name)
                    {
                        case 'edge_top_left':
                            scope.edgeObjects.topLeft = child;
                            break;
                        case 'edge_top_right':
                            scope.edgeObjects.topRight = child;
                            break;
                        case 'edge_bottom_left':
                            scope.edgeObjects.bottomLeft = child;
                            break;
                        case 'edge_bottom_right':
                            scope.edgeObjects.bottomRight = child;
                            break;
                    }

                }
            });
            scope.edgesLoaded = true;
        });
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
        let trackedPerson = this.getPerson(person.traceId);

        if (!trackedPerson)
        {
            trackedPerson = new People();
        }

        // Sanity check for valid frame data
        if (!person.source_width || !person.source_height)
        {
            return trackedPerson;
        }


        trackedPerson.traceId = person.traceId;
        trackedPerson.pose = person.objects;


        // BOUNDING BOX
        // the bounding box of the person
        // the top left position of the person
        // Flip the X, Y coordinates to match THREE.js
        let normalizedTopLeft = this.normalizePosition(person, person.source_width, person.source_height);
        trackedPerson.topLeftPoint.x = normalizedTopLeft.x / 2;
        trackedPerson.topLeftPoint.y = normalizedTopLeft.y / 2;

        let maxX = person.x + person.width;
        let maxY = person.y + person.height;

        const normalizedBottomRight = this.normalizePosition(
            { x: maxX, y: maxY },
            person.source_width,
            person.source_height
        );

        trackedPerson.bottomRightPoint.x = normalizedBottomRight.x / 2;
        trackedPerson.bottomRightPoint.y = normalizedBottomRight.y / 2;

        trackedPerson.bounds = new THREE.Box3();
        trackedPerson.bounds.min.x = normalizedTopLeft.x;
        trackedPerson.bounds.min.y = normalizedTopLeft.y;
        trackedPerson.bounds.max.x = normalizedBottomRight.x;
        trackedPerson.bounds.max.y = normalizedBottomRight.y;

        trackedPerson.boundsWidth = Math.abs(normalizedTopLeft.x - normalizedBottomRight.x);
        trackedPerson.boundsHeight = Math.abs(normalizedTopLeft.y - normalizedBottomRight.y);

        trackedPerson.position = new THREE.Vector3();
        trackedPerson.position.x = (normalizedTopLeft.x + normalizedBottomRight.x) / 2;
        trackedPerson.position.y = (normalizedTopLeft.y + normalizedBottomRight.y) / 2;

        // PATH
        // Capturing the path of the person
        if (window.DEBUG_thirdEyePop.showFootTraffic)
        {
            const pathPoint = { ...normalizedBottomRight };
            // clamp path point to -1 and 1
            pathPoint.x = trackedPerson.position.x;

            pathPoint.y = Math.min(Math.max(pathPoint.y, -1), 1);

            this.trackNewPosition(pathPoint);
            trackedPerson.position.x = pathPoint.x;
            trackedPerson.position.y = pathPoint.y;
        } else
        {
            this.trackNewPosition(trackedPerson.position);
        }

        trackedPerson.addPathPoint(trackedPerson.position);
        this.peopleMap.set(person.traceId, trackedPerson);

        this.updatePoseGeometry(person, trackedPerson);

        return trackedPerson;

    }

    updatePoseGeometry(person, trackedPerson)
    {
        let poseIndex = null;

        if ("objects" in person)
        {
            // find the pose index, there may be other objects like face, and hands in the array
            poseIndex = person.objects.findIndex(object => object.classLabel === 'pose');
        }

        // if theres no pose index found, assume ther pose data is in the keyPoints array
        if (poseIndex < 0)
        {
            poseIndex = null
        }

        this.buildPoseGeometryMediaPipe33(person, trackedPerson, poseIndex);

    }

    buildPoseGeometryMediaPipe33(person, trackedPerson, poseIndex = null)
    {
        if (!("keyPoints" in person) && !poseIndex) return;

        let keyPoints = null;

        if (poseIndex)
        {
            keyPoints = person.objects[ poseIndex ].keyPoints[ 0 ].points;
        } else
        {
            keyPoints = person.keyPoints[ 0 ].points;
        }

        keyPoints.forEach((point) =>
        {
            const tempPoint = new THREE.Vector3(point.x, point.y, 0);
            const normalizedPoint = this.normalizePosition(tempPoint, person.source_width, person.source_height);

            trackedPerson.poseData.points[ point.classLabel ] = new THREE.Vector3(normalizedPoint.x, normalizedPoint.y, 0);
        });

        // next we create a 2d array of the connection points based on the poseDataConnections array
        trackedPerson.poseData.edges = this.poseConnections33.map((connection) =>
        {
            return [ trackedPerson.poseData.points[ connection[ 0 ] ], trackedPerson.poseData.points[ connection[ 1 ] ] ];
        });

        // create multiple line segments based on the edges and merge them all into one mesh then add that to the poseData.mesh object
        let poseGeometry = [];
        trackedPerson.poseData.edges.forEach((edgePoints) =>
        {
            // skip if any edgePoints are null
            if (!edgePoints[ 0 ] || !edgePoints[ 1 ])
            {
                return;
            }
            const edgeGeometry = new THREE.BufferGeometry().setFromPoints(edgePoints);

            poseGeometry.push(edgeGeometry);
        });


        if (poseGeometry.length > 0)
        {
            trackedPerson.poseData.geometry = BufferGeometryUtils.mergeGeometries(poseGeometry, 0);
        }
    }

    removePerson(traceID)
    {
        this.peopleMap.delete(traceID);
    }

    trackNewPosition(position)
    {
        if (this.allPeoplePositions.length > this.maxPeoplePositions)
        {
            this.allPeoplePositions.shift();
        }

        this.allPeoplePositions.push(position);
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

    getAllPathPoints()
    {
        return this.allPeoplePositions;
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

    dispose()
    {
        this.peopleMap.clear();
        this.hotSpotMap.clear();
        this.allPeoplePositions = [];
    }


}
