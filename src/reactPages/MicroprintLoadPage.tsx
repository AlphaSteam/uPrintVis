import React, { useState, useEffect } from "react";
import queryString from 'query-string';
import Microprint from "./Microprint";
import GenerateMicroprint from "../components/Forms/GenerateMicroprint";
import LoadMicroprint from "../components/Forms/LoadMicroprint";

export default function MicroprintLoadPage() {
    const [url, setUrl] = useState<(string)>("");
    const [ref, setRef] = useState<(string)>("");
    const [token, setToken] = useState<(string)>("");

    const [svgSource, setSvgSource] = useState<(string)>("");

    const [isLoading, setIsLoading] = useState(true);

    const [stateIsMicroprintLoaded, setStateIsMicroprintLoaded] = useState<(boolean)>(false);

    const [db, setDB] = useState<(IDBDatabase | null)>(null);
    const [isLoadingDB, setIsLoadingDB] = useState<(boolean)>(true);

    useEffect(()=>{
        const dbName = "uPrintVisDB";

        const request = indexedDB.open(dbName, 1);
        
        request.onsuccess = function (evt) {
            setDB(this.result);
            setIsLoadingDB(false);
          };

        request.onerror = (event) => {
          console.error("Couldn't open database", event);

          setIsLoadingDB(false);
        };
    
        request.onupgradeneeded = (event: any) => {
            const new_db = event?.target?.result;
        
            const objectStore = new_db.createObjectStore("microprints", { keyPath: "name" });
        
            objectStore.createIndex("name", "name", { unique: false });

            setDB(new_db);
            setIsLoadingDB(false);
        };
    },[])

    window.onpopstate = (event) => {
        const state = event?.state

        setStateIsMicroprintLoaded(!!state?.microprintLoaded);

        if (!state || !state?.microprintLoaded) {
            setSvgSource("");
        } else {
            const objectStore = db?.transaction(["microprints"])?.objectStore("microprints");

            const request =  objectStore?.get("stateSource")
            
            if (request){
                request.onsuccess = (event: any) => {
                    const stateSource = event.target?.result.svg;
    
                    if (stateSource && !url) {
                        setSvgSource(stateSource);
                    }

                    setIsLoading(false)
                }
            }
        }
    }

    useEffect(() => {
        if (svgSource && !stateIsMicroprintLoaded && !url) {
            history.pushState({ microprintLoaded: true }, "", window.location.pathname);
        }

    }, [svgSource])

    useEffect(() => {
        type QueryTypes = { url: string, ref: string, token: string }
        const { url, ref, token } =
            queryString.parse(window.location.search, { arrayFormat: 'bracket' }) as QueryTypes;

        if (url) {
            setUrl(url);
        }

        if (ref) {
            setRef(ref);
        }

        if (token) {
            setToken(token);
        }

    }, [window.location.search])

    useEffect(() => {
        const headers: { headers: { Accept: string; Authorization: string }; } =
        {
            headers: {
                "Accept": "application/vnd.github.v3.raw",
                "Authorization": token && `token ${token}`
            }
        }

        const awaitFetch = async () => {
            await fetch(`${url}?ref=${ref || "main"}`, headers)
                .then((response) => response.text())
                .then((data) => {
                    if (db){
                         db.transaction(["microprints"], "readwrite").objectStore("microprints").delete("svgSource");
                    }
    
                    setSvgSource(data)
                });
        }

        if (url) {
            setIsLoading(true);

            awaitFetch().then(() => setIsLoading(false));
        }
        else {
            setIsLoading(false);
        }
    }, [url])



    useEffect(() => {
        if (!isLoadingDB && db){
            const objectStore = db?.transaction(["microprints"])?.objectStore("microprints");

            const request =  objectStore?.get("svgSource")
            
            if (request){
                setIsLoading(true)

                request.onsuccess = (event: any) => {
                    const localSvgSource = event.target?.result?.svg;
    
                    if (localSvgSource && !url) {
                        setSvgSource(localSvgSource);
                    }

                    setIsLoading(false)
                }
            }
        }
    }, [isLoadingDB])


    const loadingMessage = (message: string) => {
        return (
            <div style={{
                display: "flex",
                justifyContent: "center",
                height: "100vh",
                width: "100vw"
            }}>
                <span style={{
                    alignSelf: "center"
                }}>
                    {message}
                </span>
            </div>
        )
    }

    if (isLoading || isLoadingDB) {
        return loadingMessage("Loading...")
    }

    if (!svgSource) {
        return (
            <div style={{
                display: "flex",
                height: "100vh",
                flexDirection: "column",
                padding: "1rem"
            }}>
                <h3 style={{
                    textAlign: "center",
                }}>
                    μPrintVis
                </h3>

                <LoadMicroprint setSvgSource={setSvgSource} db={db}/>

                <GenerateMicroprint setSvgSource={setSvgSource} db={db}/>
            </div>
        )
    }

    return <Microprint svgSource={svgSource} db={db}/>
}