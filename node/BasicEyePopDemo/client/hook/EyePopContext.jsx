import React, { createContext, useState, useContext, useRef, useEffect } from 'react';

import { EyePop } from "@eyepop.ai/eyepop";
const EyePopContext = createContext();

const EyePopProvider = ({ children }) =>
{
    const [ results, setResults ] = useState(null);
    const [ endpoint, setEndpoint ] = useState(undefined);
    const [ isLoadingEyePop, setLoading ] = useState(true);

    // Initialize the EyePop.ai endpoint
    useEffect(() =>
    {
        // API key and popID are easily obtained from the EyePop.ai dashboard
        EyePop.endpoint({
            auth: { oAuth2: true },
            popId: 'e4fd9369a9de42f6becfb90e11f4620c',
        })
            .onStateChanged((from, to) =>
            {
                console.log("EyePop.ai endpoint state transition from " + from + " to " + to);
            })
            .connect()
            .then((endpoint) =>
            {
                setEndpoint(endpoint);
                console.log('EyePop.ai endpoint connected:', endpoint);
                setLoading(false);
            });

    }, []);



    // Analyze an image and parse results
    async function checkURL(url = '', category = 'medical')
    {
        const result = await endpoint.process({ url: url });
        return testResults(result);
    }

    // Analyze an image and parse results
    async function checkFile(fileContent = null, category = 'medical')
    {
        const result = await endpoint.process({ file: fileContent });
        return testResults(result);
    }

    // Analyze an image and parse results
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


    // Test for medical category, which requires at least one person in the frame
    //  and the person should take up 20 - 50 % of the area of the photo
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

            totalObjectWidth += (element.width) / sourceWidth;
            totalObjectHeight += (element.height) / sourceHeight;

        }

        const totalObjectArea = totalObjectWidth * totalObjectHeight;
        console.log('personCount:', personCount);
        console.log('totalObjectArea:', totalObjectArea);


        if (personCount > 0 &&
            totalObjectArea > 0.2 &&
            totalObjectArea < 0.5)
        {
            isValid = true;
        }

        return isValid;
    }

    // Test for animal category, which requires at least one animal in the frame
    // and the animal should take up 20 - 50 % of the area of the photo
    function testAnimal(results)
    {
        let isValid = false;

        const animalLabels = [ 'bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe' ];
        let animalCount = 0;
        let totalObjectWidth = 0;
        let totalObjectHeight = 0;
        let sourceWidth = results.source_width;
        let sourceHeight = results.source_height;

        for (let i = 0; i < results.objects.length; i++)
        {
            const element = results.objects[ i ];

            if (animalLabels.includes(element.label))
            {
                animalCount++;
            }

            totalObjectWidth += (element.width) / sourceWidth;
            totalObjectHeight += (element.height) / sourceHeight;
        }

        const totalObjectArea = totalObjectWidth * totalObjectHeight;

        if (animalCount > 0 &&
            totalObjectArea > 0.2 &&
            totalObjectArea < 0.5)
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
            {!isLoadingEyePop && children}
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
