import DOMPurify from 'isomorphic-dompurify';
import { useEffect, useState, useCallback, Dispatch, SetStateAction } from "react"
import SvgInline from 'react-inlinesvg';

export default function SVG(props: {
    svgSource: string,
    setSvgRef: Dispatch<SetStateAction<SVGElement | null>>
}) {
    const { svgSource, setSvgRef = () => null } = props;

    const [defaultRef, setDefaultRef] = useState<SVGElement | null>(null);

    const defaultRefCallback = useCallback((node: SVGElement) => {
        if (node) {
            setDefaultRef(node);
        }
    }, [])

    useEffect(() => {
        if (defaultRef) {
            setSvgRef(defaultRef)
        }
    }, [defaultRef])

    return (
        <SvgInline innerRef={defaultRefCallback} src={DOMPurify.sanitize(svgSource)}
            style={{
                width: "auto",
            }
            }
            title="Microprint"
        />
    )
}
