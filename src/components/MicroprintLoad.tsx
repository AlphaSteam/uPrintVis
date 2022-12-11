import React, { useState, useEffect } from "react";
import queryString from 'query-string';
import Microprint from "./Microprint";
import { instanceOf } from "prop-types";

export default function MicroprintLoad() {
    const [url, setUrl] = useState<(string)>("");
    const [ref, setRef] = useState<(string)>("");
    const [token, setToken] = useState<(string)>("");

    const [svgSource, setSvgSource] = useState<(string)>("");

    const [fileSource, setFileSource] = useState<(string)>("");
    const [saveFileSource, setSaveFileSource] = useState<(boolean)>(false);


    const [isLoading, setIsLoading] = useState(true);


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
                    localStorage.clear();
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
        const localSvgSource = localStorage.getItem("svgSource");

        if (localSvgSource && !url) {
            setSvgSource(localSvgSource);
        }
    }, [])

    const renderSvgFileLoad = () => {
        return (
            <div style={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: "rgba(181, 167, 167, 0.1)",
                padding: "0.5rem",
                borderRadius: 9,
                width: "50%",
                alignSelf: "center"
            }}>
                <label style={{
                    fontSize: 16,
                    marginBottom: "0.5rem"
                }}>
                    Load microprint SVG
                </label>

                <input
                    style={{
                        border: "black solid 1px",
                        padding: "0.3rem",
                        borderRadius: 6,
                        marginBottom: "0.5rem"
                    }}
                    type="file"
                    onChange={async (event) => {
                        const files = event?.target?.files;
                        let file;

                        if (files) {
                            file = files[0];
                        }

                        if (file) {
                            const reader = new FileReader();

                            reader.addEventListener("load", (event) => {
                                const result = event?.target?.result

                                if (result && typeof (result) === "string") {
                                    setFileSource(result);
                                }

                            }, false);

                            reader.readAsText(file)
                        }
                    }} />
                <div style={{ display: "flex" }}>
                    <input
                        type="checkbox"
                        id="remember"
                        name="remember"
                        style={{
                            marginRight: "0.3rem"
                        }}
                        onClick={() => { setSaveFileSource((oldValue) => !oldValue) }}
                    />

                    <label
                        htmlFor="remember"
                        style={{
                            fontSize: 16,
                        }}
                    >
                        Save microprint into memory
                    </label>
                </div>

                <div style={{
                    display: "flex",
                    justifyContent: "center"
                }}>
                    <button
                        onClick={() => {
                            if (fileSource) {
                                if (saveFileSource) {
                                    localStorage.setItem("svgSource", fileSource);
                                }

                                setSvgSource(fileSource);
                            }
                        }}
                        disabled={!fileSource}
                    >
                        Load microprint
                    </button>
                </div>
            </div>)
    }

    if (isLoading) {
        return (
            <div style={{
                display: "flex",
                justifyContent: "center",
                height: "100vh"
            }}>
                <span style={{
                    alignSelf: "center"
                }}>
                    Loading...
                </span>
            </div>
        )
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
                    MicroVis
                </h3>

                {renderSvgFileLoad()}
            </div>

        )

    }
    return <Microprint svgSource={svgSource} />
}