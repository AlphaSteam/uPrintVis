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
                    localStorage.removeItem("svgSource");

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


    const loadingMessage = (message: string) => {
        return (
            <div style={{
                display: "flex",
                justifyContent: "center",
                height: "100vh"
            }}>
                <span style={{
                    alignSelf: "center"
                }}>
                    {message}
                </span>
            </div>
        )
    }

    if (isLoading) {
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

                <LoadMicroprint setSvgSource={setSvgSource} />

                <GenerateMicroprint setSvgSource={setSvgSource} />
            </div>
        )
    }

    return <Microprint svgSource={svgSource} />
}