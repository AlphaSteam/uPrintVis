import React, { useEffect, useState, useRef } from "react";
import SVG from 'react-inlinesvg';
import queryString from 'query-string';
import MicroprintText from "./MicroprintText";
import { PaintBucket } from 'lucide-react';
import FloatingButton from "./FloatingButton"

export default function Microprint() {
    const [url, setUrl] = useState<(string)>("");
    const [ref, setRef] = useState<(string)>("");
    const [token, setToken] = useState<(string)>("");
    const [fontSize, setFontSize] = useState(16)

    const [customColors, setCustomColors] = useState(true);

    const [isLoading, setIsLoading] = useState(true);

    const [svgTextLines, setSvgTextLines] = useState<SVGTextElement[]>([]);
    const [svgRects, setSvgRects] = useState<SVGRectElement[]>([]);

    const [svgSource, setSvgSource] = useState("");

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

    const setScrollTo = (element: SVGElement) => {

        const textLine = element.attributes.getNamedItem("data-text-line")?.value

        element.onclick = () => {
            if (!textLine) return

            const renderedLine = document.getElementById(`rendered-line-${parseInt(textLine, 10)}`);

            renderedLine!.scrollIntoView({ block: "center" });
        }
    }

    if (isLoading) return null

    return (
        <div>
            <div style={{
                position: "fixed",
                right: 0,
                display: "flex",
                height: "100vh",
                overflowY: "scroll"
            }}
            >   <div style={{ padding: "1rem" }}>
                    <FloatingButton backgroundColor="white" size="2rem" onClick={() => {

                        setCustomColors((oldValue) => !oldValue)
                    }}>
                        <PaintBucket color="black" size="1rem" />
                    </FloatingButton>
                </div>

                <SVG innerRef={svgRef} src={svgSource}
                    style={{
                        width: "auto",
                    }}
                    title="Microprint"
                    onLoad={(_src, _hasCache) => {
                        const current = svgRef!.current;

                        if (svgRef !== null && current !== null) {
                            const texts: SVGTextElement[] = Array.from(current.getElementsByTagName("text"));

                            setSvgTextLines(texts);

                            const rects: SVGRectElement[] = Array.from(current.getElementsByTagName("rect"));

                            setSvgRects(rects);

                            rects.forEach(setScrollTo)
                            texts.forEach(setScrollTo)
                        }
                    }}
                />
            </div>

            <div style={{ width: "fit-content" }}>
                <MicroprintText
                    textLines={svgTextLines || []}
                    fontSize={fontSize}
                    svgRects={svgRects}
                    customColors={customColors} />
            </div>
        </div>

    )
}