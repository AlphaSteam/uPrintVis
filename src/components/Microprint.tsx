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
    const [fontFamily, setFontFamily] = useState("monospace")
    const [defaultBackgroundColor, setDefaultBackgroundColor] = useState("white")
    const [defaultTextColor, setDefaultTextColor] = useState("black")

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
                "Authorization": token && `token ${token}`
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

    useEffect(() => console.log(defaultBackgroundColor), [defaultBackgroundColor])

    const setScrollTo = (element: SVGElement) => {

        const textLine = element.attributes.getNamedItem("data-text-line")?.value

        element.onclick = () => {
            if (!textLine) return

            const renderedLine = document.getElementById(`rendered-line-${parseInt(textLine, 10)}`);

            renderedLine!.scrollIntoView({ block: "center" });
        }
    }

    if (isLoading) return null

    const getMostCommonBackgroundColor = (rects: SVGRectElement[]) => {
        const colorCounts: { [n: string]: number } = {};

        rects.forEach((rect) => {

            const rectAttributes: NamedNodeMap | null = rect && rect["attributes"];

            const backgroundColor = rectAttributes ? rectAttributes.getNamedItem("fill").value : undefined;

            if (backgroundColor) {
                colorCounts[backgroundColor] = colorCounts[backgroundColor] ? colorCounts[backgroundColor] + 1 : 1;
            }
        })

        return Object.keys(colorCounts).reduce((a, b) => colorCounts[a] > colorCounts[b] ? a : b);
    }

    const getMostCommonTextColor = (texts: SVGTextElement[]) => {
        const colorCounts: { [n: string]: number } = {};

        texts.forEach((textLine) => {

            const textColor = textLine.attributes.getNamedItem("fill")?.value;


            if (textColor) {
                colorCounts[textColor] = colorCounts[textColor] ? colorCounts[textColor] + 1 : 1;
            }
        })

        return Object.keys(colorCounts).reduce((a, b) => colorCounts[a] > colorCounts[b] ? a : b);
    }

    const setDefaultBackgroundColors = (rects: SVGRectElement[]) => {
        const firstRect = rects[0];

        const firstRectAttributes: NamedNodeMap | null = firstRect && firstRect["attributes"];

        if (!firstRectAttributes) return;

        const firstBackgroundColor = firstRectAttributes ? firstRectAttributes.getNamedItem("fill").value : undefined;

        if (firstBackgroundColor) {
            setDefaultBackgroundColor(firstBackgroundColor);
        }
        else {
            setDefaultBackgroundColor(getMostCommonBackgroundColor(rects))
        }
    }

    const setDefaultTextColors = (texts: SVGTextElement[], textGroup: SVGGElement) => {
        const color: string | undefined = textGroup?.attributes?.getNamedItem("fill")?.value;

        if (color) {
            setDefaultTextColor(color);
        }
        else {
            setDefaultTextColor(getMostCommonTextColor(texts))
        }
    }

    const setDefaultColors = (rects: SVGRectElement[], texts: SVGTextElement[], textGroup: SVGGElement) => {
        setDefaultBackgroundColors(rects);
        setDefaultTextColors(texts, textGroup);
    }

    return (
        <div style={{ backgroundColor: defaultBackgroundColor, color: defaultTextColor }}>
            <div style={{
                position: "fixed",
                right: 0,
                display: "flex",
                height: "100vh",
                overflowY: "scroll"
            }}
            >   <div style={{ padding: "1rem" }}>
                    <FloatingButton
                        backgroundColor="white"
                        size="2rem"
                        onClick={() => {
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
                        const current = svgRef.current;

                        if (svgRef !== null && current !== null) {

                            const group: SVGGElement = Array.from(current.getElementsByTagName("g"))[1];

                            const fontFamily: string = group.attributes.getNamedItem("font-family")?.value || "monospace";

                            setFontFamily(fontFamily)

                            const texts: SVGTextElement[] = Array.from(current.getElementsByTagName("text"));

                            setSvgTextLines(texts);

                            const rects: SVGRectElement[] = Array.from(current.getElementsByTagName("rect"));

                            setSvgRects(rects);

                            rects.forEach(setScrollTo);
                            texts.forEach(setScrollTo);

                            setDefaultColors(rects, texts, group);
                        }
                    }}
                />
            </div>

            <div style={{ width: "fit-content" }}>
                <MicroprintText
                    fontFamily={fontFamily}
                    textLines={svgTextLines || []}
                    fontSize={fontSize}
                    svgRects={svgRects}
                    customColors={customColors}
                    defaultColors={{ background: defaultBackgroundColor, text: defaultTextColor }}
                />
            </div>
        </div>

    )
}