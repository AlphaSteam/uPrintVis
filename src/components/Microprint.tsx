import React, { useEffect, useState, useRef } from "react";
import SVG from 'react-inlinesvg';
import queryString from 'query-string';
import MicroprintText from "./MicroprintText";
import { PaintBucket } from 'lucide-react';
import FloatingButton from "./FloatingButton";

export default function Microprint() {
    const [url, setUrl] = useState<(string)>("");
    const [ref, setRef] = useState<(string)>("");

    const [token, setToken] = useState<(string)>("");

    const [fontSize, setFontSize] = useState(16)
    const [fontFamily, setFontFamily] = useState("monospace")

    const [defaultBackgroundColor, setDefaultBackgroundColor] = useState("white")
    const [defaultTextColor, setDefaultTextColor] = useState("black")
    const [customColors, setCustomColors] = useState(true);

    const [svgHeight, setSvgHeight] = useState(0);

    const [textViewAreaScrollTop, setTextViewAreaScrollTop] = useState(0);
    const [textViewAreaVisible, setTextViewAreaVisible] = useState(false);

    const [isLoading, setIsLoading] = useState(true);

    const [svgTextLines, setSvgTextLines] = useState<SVGTextElement[]>([]);
    const [svgRects, setSvgRects] = useState<SVGRectElement[]>([]);

    const [svgSource, setSvgSource] = useState("");

    const svgRef = useRef<SVGElement>(null);

    const svgDivRef = useRef<HTMLDivElement>(null);
    const textDivRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        if (svgDivRef && svgDivRef.current) {
            const height = svgDivRef.current.offsetHeight;
            setSvgHeight(height);
        }
    });

    useEffect(() => {
        const { url, ref, token }: { url: string, ref: string, token: string } = queryString.parse(window.location.search, { arrayFormat: 'bracket' });

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
        const handleScroll = () => {
            if (svgDivRef && svgDivRef.current && textDivRef && textDivRef.current) {
                const svgScrollHeight = svgDivRef.current.scrollHeight;

                const maxSvgScroll = svgScrollHeight - svgHeight;

                const textScrollHeight = textDivRef.current.scrollHeight

                const textHeight = textDivRef.current.offsetHeight

                const maxTextScroll = textScrollHeight - textHeight;

                const svgScrollTop = (window.scrollY * maxSvgScroll) / maxTextScroll

                setTextViewAreaScrollTop(window.scrollY * window.innerHeight / textScrollHeight);

                svgDivRef.current.scrollTop = svgScrollTop;
            }
        }

        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener("scroll", handleScroll);
    }, [svgHeight]);

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

            const backgroundColor = rectAttributes ?
                rectAttributes.getNamedItem("fill").value : undefined;

            if (backgroundColor) {
                colorCounts[backgroundColor] = colorCounts[backgroundColor] ?
                    colorCounts[backgroundColor] + 1 : 1;
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

        const firstBackgroundColor = firstRectAttributes ?
            firstRectAttributes.getNamedItem("fill").value : undefined;

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

    const setDefaultColors = (rects: SVGRectElement[],
        texts: SVGTextElement[], textGroup: SVGGElement) => {
        setDefaultBackgroundColors(rects);
        setDefaultTextColors(texts, textGroup);
    }

    // TODO: GET HEIGHT
    const renderTextViewArea = () => (<div
        style={{
            transition: "opacity 0.1s",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            height: "8.7rem",
            position: "absolute",
            width: "100%",
            top: textViewAreaScrollTop,
            opacity: textViewAreaVisible ? "100" : "0"
        }} />)

    return (
        <div style={{ backgroundColor: defaultBackgroundColor, color: defaultTextColor }}>
            <div style={{
                position: "fixed",
                right: 0,
                display: "flex",
                height: "100vh",
            }}>
                <div style={{ padding: "1rem" }}>
                    <FloatingButton
                        backgroundColor="white"
                        size="2rem"
                        onClick={() => {
                            setCustomColors((oldValue) => !oldValue)
                        }}>
                        <PaintBucket color="black" size="1rem" />
                    </FloatingButton>
                </div>

                <div ref={svgDivRef} style={{
                    overflow: "hidden",
                    boxShadow: "-4px 2px 5px 0px rgba(0,0,0,0.4)",
                    paddingLeft: "0.3rem",
                    backgroundColor: defaultBackgroundColor,
                }}
                    onMouseEnter={(() => setTextViewAreaVisible(true))}
                    onMouseLeave={(() => setTextViewAreaVisible(false))}
                >
                    {renderTextViewArea()}

                    <SVG innerRef={svgRef} src={svgSource}
                        style={{
                            width: "auto",
                        }}
                        title="Microprint"
                        onLoad={(_src, _hasCache) => {
                            const current = svgRef.current;

                            if (svgRef !== null && current !== null) {

                                const group: SVGGElement = Array.from(current
                                    .getElementsByTagName("g"))[1];

                                const fontFamily: string = group.attributes
                                    .getNamedItem("font-family")?.value || "monospace";

                                setFontFamily(fontFamily)

                                const texts: SVGTextElement[] = Array.from(current
                                    .getElementsByTagName("text"));

                                setSvgTextLines(texts);

                                const rects: SVGRectElement[] = Array.from(current
                                    .getElementsByTagName("rect"));

                                setSvgRects(rects);

                                rects.forEach(setScrollTo);
                                texts.forEach(setScrollTo);

                                setDefaultColors(rects, texts, group);
                            }
                        }}
                    />
                </div>
            </div>

            <div style={{
                width: "fit-content", height: "100vh",
            }} ref={textDivRef} >
                <MicroprintText
                    fontFamily={fontFamily}
                    textLines={svgTextLines || []}
                    fontSize={fontSize}
                    svgRects={svgRects}
                    customColors={customColors}
                    defaultColors={{ background: defaultBackgroundColor, text: defaultTextColor }}
                />
            </div>
        </div >
    )
}