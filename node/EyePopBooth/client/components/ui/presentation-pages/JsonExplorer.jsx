import '@alenaksu/json-viewer';
import React, { useEffect, useRef } from 'react';

const JsonExplorer = (props) =>
{
    const jsonViewerRef = useRef();

    useEffect(() =>
    {
        if (!jsonViewerRef.current) return;
        jsonViewerRef.current.expandAll();
    }, [ jsonViewerRef.current ]);

    return (
        <>
            <div className={props.className} style={{ overflow: 'auto' }}>
                <json-viewer ref={jsonViewerRef} className="rounded-lg h-full" data={JSON.stringify(props.data)}>
                </json-viewer>
            </div>
        </>
    );
}

export default JsonExplorer;
