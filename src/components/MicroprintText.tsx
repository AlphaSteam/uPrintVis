
export default function MicroprintText(props: { textLines: any; fontSize: number }) {
    const { textLines, fontSize } = props;


    return (
        <div style={{ "overflow": "visible", "whiteSpace": "nowrap" }}>
            {textLines.map((textLine: HTMLElement, index: number) => {

                const lineNumber = textLine.attributes.getNamedItem("data-text-line")?.value

                return (
                    <span
                        style={{ fontSize }}
                        id={`rendered-line-${lineNumber}`}
                        key={index}>{lineNumber}|{textLine.textContent} <br />
                    </span>)
            })}
        </div>

    )
}