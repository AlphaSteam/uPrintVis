import {
    useState, Dispatch, useRef, useEffect
} from "react"

export default function GenerateMicroprint(props: {
    setSvgSource: Dispatch<React.SetStateAction<string>>
}) {

    const [textFile, setTextFile] = useState<(File | null)>(null);
    const [configFile, setConfigFile] = useState<(File | null)>(null);

    const [saveFileSource, setSaveFileSource] = useState<(boolean)>(false);

    const [downloadMicroprint, setDownloadMicroprint] = useState<(boolean)>(false);

    const { setSvgSource } = props;

    const downloadRef = useRef<HTMLAnchorElement>(null);


    const generateMicroprint = async (textFile: File, configFile: File) => {
        const formData = new FormData();
        formData.append('text_file', textFile);
        formData.append('config_file', configFile);


        fetch('https://uprintapi.vercel.app/microprint/generate', { body: formData, method: "POST" })
            .then(res => res.blob()) // Gets the response and returns it as a blob
            .then(async (blob) => {
                const textBlob = await blob.text();

                if (saveFileSource) {
                    localStorage.setItem("svgSource", textBlob);
                }


                if (!downloadMicroprint) {
                    setSvgSource(textBlob);
                }

                if (downloadMicroprint && textBlob) {
                    if (downloadRef?.current) {
                        downloadRef.current.href = URL.createObjectURL(new Blob([textBlob], { type: "image/svg+xml" }));

                        downloadRef.current.click();

                        setSvgSource(textBlob);
                    }
                }
            });
    }


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
            <h3 style={{
                fontSize: 16,
                marginBottom: "0.5rem"
            }}>
                Generate microprint SVG
            </h3>
            <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: "1",
                    marginBottom: "0.5rem"
                }}>

                    <label style={{ fontSize: 16, marginBottom: "0.5rem" }}>
                        Text file
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
                                setTextFile(file)
                            }
                        }} />
                </div>

                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: "1"
                }}>

                    <label style={{ fontSize: 16, marginBottom: "0.5rem" }}>
                        Configuration JSON file
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
                                setConfigFile(file)
                            }
                        }} />
                </div>
            </div>

            <div style={{ display: "flex", marginBottom: '0.5rem' }}>
                <input
                    type="checkbox"
                    id="remember_generate"
                    name="remember_generate"
                    style={{
                        marginRight: "0.3rem"
                    }}
                    onClick={() => { setSaveFileSource((oldValue) => !oldValue) }}
                />

                <label
                    htmlFor="remember_generate"
                    style={{
                        fontSize: 16,
                    }}
                >
                    Save microprint into memory
                </label>
            </div>

            <div style={{ display: "flex", marginBottom: '0.5rem' }}>
                <input
                    type="checkbox"
                    id="download"
                    name="download"
                    style={{
                        marginRight: "0.3rem"
                    }}
                    onClick={() => { setDownloadMicroprint((oldValue) => !oldValue) }}
                />

                <label
                    htmlFor="download"
                    style={{
                        fontSize: 16,
                    }}
                >
                    Automatically download generated microprint
                </label>
            </div>

            <div style={{
                display: "flex",
                justifyContent: "center"
            }}>
                <button
                    onClick={async () => {
                        if (textFile && configFile) {
                            await generateMicroprint(textFile, configFile)
                        }
                    }}
                    disabled={!(textFile && configFile)}
                >
                    Generate microprint
                </button>
            </div>

            <a
                download="Microprint.svg"
                style={{
                    display: "none",
                    visibility: "hidden"
                }}
                ref={downloadRef}
            />
        </div>
    )
}