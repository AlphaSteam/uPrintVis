import React, { useEffect, useState, useRef } from "react";
import SVG from 'react-inlinesvg';
import queryString from 'query-string';
import MicroprintText from "./MicroprintText";
import { useElementSize } from 'usehooks-ts'

export default function Microprint() {
    const [url, setUrl] = useState<(string)>("");
    const [ref, setRef] = useState<(string)>("");
    const [token, setToken] = useState<(string)>("");


    const [isLoading, setIsLoading] = useState(true);
    const [svgTextLines, setSvgTextLines] = useState<Element[]>([]);
    const [svgSource, setSvgSource] = useState("");

    const [divRef, { width }] = useElementSize();

    const svgRef = useRef<SVGElement>(null);

    useEffect(() => {
        const { url, ref, token } = queryString.parse(window.location.search, { arrayFormat: 'bracket' });

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
                "Authorization": token && `token${token}`
            }
        }

        const awaitFetch = async () => {
            await fetch(`${url}?ref=${ref || "main"}`, headers).then((response) => response.text())
                .then((data) => {
                    setSvgSource(data)
                });
        }

        if (url) {
            awaitFetch().then(() => setIsLoading(false));
        }
    }, [url])

    if (isLoading) return null
    return (
        <div>
            <div style={{
                position: "fixed",
                right: 0,
                display: "flex"
            }}
                ref={divRef}
            >
                <SVG innerRef={svgRef} src={svgSource}
                    style={{
                        width: "auto",
                    }}
                    title="Microprint"
                    onLoad={(_src, _hasCache) => {
                        const current = svgRef!.current;

                        if (svgRef !== null && current !== null) {
                            const texts: Element[] = Array.from(current.getElementsByTagName("text"));
                            setSvgTextLines(texts);
                        }
                    }}
                />
            </div>

            <div style={{ width: `calc(100% - ${width}px)` }}>
                <MicroprintText textLines={svgTextLines || []} />
            </div>
        </div>

    )
}