import React, { useEffect, useState, useRef } from "react";
import SVG from 'react-inlinesvg';
import queryString from 'query-string';
import MicroprintText from "./MicroprintText";
import { useElementSize } from 'usehooks-ts'

export default function Microprint() {
    const [url, setUrl] = useState<(string)>("");
    const [isLoading, setIsLoading] = useState(true);
    const [svgTextLines, setSvgTextLines] = useState<Element[]>([]);
    const [svgSource, setSvgSource] = useState("");

    const [divRef, { width }] = useElementSize();

    const svgRef = useRef<SVGElement>(null);

    useEffect(() => {
        const query = queryString.parse(window.location.search, { arrayFormat: 'bracket' });
        if (query && query["url"]) {
            const { url = "" } = query;
            setUrl(url);
        }
    }, [])

    useEffect(() => {
        const awaitFetch = async () => {
            await fetch(url, { headers: { "Accept": "application/vnd.github.v3.raw" } }).then((response) => response.json())
                .then((data) => {
                    setSvgSource(data?.download_url)
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

                        if (!current) { return }

                        if (svgRef !== null && svgRef.current !== null) {
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