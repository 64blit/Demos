import React, { createContext, useState, useContext, useRef, useEffect } from 'react';

import { EyePop } from "@eyepop.ai/eyepop";
const EyePopContext = createContext();

const EyePopProvider = ({ children }) =>
{
    const [ results, setResults ] = useState(null);
    const [ endpoint, setEndpoint ] = useState(undefined);

    // Initialize the EyePop.ai endpoint
    useEffect(() =>
    {
        async function setup()
        {

            // API key and popID are easily obtained from the EyePop.ai dashboard
            const newEndpoint = await EyePop.endpoint({
                auth: { secretKey: 'AAF8CqARHHgQBcLhHqLPUjJxZ0FBQUFBQmw0QXNqX2pqMzlaZ292b05LdHhrRmowUGlrNUREUDVYQTE2TW1zQWYyU2U0eVRmQS0xSVdnWkZvRldQOGd2Y2hKWG9kYnI0MzJnRGwyWGJoTExYNkVwQzVLdHZvRzBIMTlLdTFaZ2JEWFJPTERzbTQ9' },
                popId: 'e4fd9369a9de42f6becfb90e11f4620c',
            })
                .onStateChanged((from, to) =>
                {
                    console.log("EyePop.ai endpoint state transition from " + from + " to " + to);
                });

            // Boots up the worker server
            await newEndpoint.connect();

            setEndpoint(newEndpoint);

            console.log('EyePop.ai endpoint connected:', newEndpoint);
        }

        setup();
    }, []);


    async function checkURL(url = '', category = 'medical')
    {
        const result = await endpoint.process({ url: url });
        return testResults(result);
    }

    async function checkFile(fileContent = null, category = 'medical')
    {
        const result = await endpoint.process({ file: fileContent });
        return testResults(result);
    }

    async function checkPath(path = '', category = 'medical')
    {
        const result = await endpoint.process({ path: path });
        return testResults(result);
    }

    async function testResults(results, category = 'medical')
    {
        let isValid = false;

        for await (let result of results)
        {
            console.log('All results:', result);
            setResults(result);

            const objects = result.objects;

            if (!objects)
            {
                break;
            }

            if (category === 'medical')
            {
                isValid = testMedical(result);
            }
            else if (category === 'animal')
            {
                isValid = testAnimal(result);
            }

        }

        return isValid;
    }


    function testMedical(results)
    {
        let isValid = false;

        let personCount = 0;
        let totalObjectWidth = 0;
        let totalObjectHeight = 0;
        let sourceWidth = results.source_width;
        let sourceHeight = results.source_height;

        // Check for the percentage of the frame taken up by a person
        //   and the number of people in the frame
        for (let i = 0; i < results.objects.length; i++)
        {
            const element = results.objects[ i ];

            if (element.label === 'person')
            {
                personCount++;
            }

            totalObjectWidth += sourceWidth / (element.x + element.width);
            totalObjectHeight += sourceHeight / (element.y + element.height);

        }

        console.log('personCount:', personCount);
        console.log('totalObjectWidth:', totalObjectWidth);
        console.log('totalObjectHeight:', totalObjectHeight);

        if (
            personCount > 0 &&
            totalObjectWidth > 0.2 &&
            totalObjectWidth < 0.5 &&
            totalObjectHeight > 0.2 &&
            totalObjectHeight < 0.5
        )
        {
            isValid = true;
        }

        return isValid;
    }

    function testAnimal(results)
    {
        // Category[ Animals ]
        // ------- Have at least one animal
        // ------- any animal should only take up 20 - 50 % of the area of the photo
        let isValid = false;

        const animalLabels = [ 'bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe' ];
        let animalCount = 0;
        let totalObjectWidth = 0;
        let sourceWidth = results.source_width;
        let sourceHeight = results.source_height;

        for (let i = 0; i < results.objects.length; i++)
        {
            const element = results.objects[ i ];

            if (animalLabels.includes(element.label))
            {
                animalCount++;
            }

            totalObjectWidth += sourceWidth / (element.x + element.width);
            totalObjectHeight += sourceHeight / (element.y + element.height);
        }
        if (animalCount > 0 &&
            totalObjectWidth > 0.2 &&
            totalObjectWidth < 0.5
            && totalObjectHeight > 0.2
            && totalObjectHeight < 0.5
        )
        {
            isValid = true;
        }

        return isValid;
    }

    return (
        <EyePopContext.Provider value={{
            results,
            endpoint,
            checkURL,
            checkFile,
            checkPath,
        }}>
            {children}
        </EyePopContext.Provider>
    );
};

const useEyePop = () =>
{
    const context = useContext(EyePopContext);
    if (context === undefined)
    {
        throw new Error('useEyePop must be used within an EyePopProvider');
    }
    return context;
};


export { EyePopProvider, useEyePop };
