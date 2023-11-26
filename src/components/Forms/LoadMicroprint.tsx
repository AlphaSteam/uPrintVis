import React, {
    useState, Dispatch, useEffect
} from "react"

export default function LoadMicroprint(props: {
    setSvgSource: Dispatch<React.SetStateAction<string>>,
    db: IDBDatabase | null
}) {
    const [fileSource, setFileSource] = useState<(string)>("");
    const [saveFileSource, setSaveFileSource] = useState<(boolean)>(false);

    const { setSvgSource, db } = props;
    
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
                Load microprint SVG
            </h3>
            <label style={{ fontSize: 16, marginBottom: "0.5rem" }}>
                Microprint SVG file
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
                        const loadedMicroprint = await file.text();

                        if (loadedMicroprint && typeof (loadedMicroprint) === "string") {
                            setFileSource(loadedMicroprint);
                        }
                    }
                }} />
            <div style={{ display: "flex", marginBottom: '0.5rem' }}>
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
                            const objectStore = db
                                ?.transaction(["microprints"], "readwrite")
                                ?.objectStore("microprints");

                            if (saveFileSource && objectStore) {
                                objectStore.put({name: "svgSource", svg: fileSource});
                            }

                            if (objectStore) {
                                objectStore.put({name: "stateSource", svg: fileSource});
                            }

                            setSvgSource(fileSource);
                        }
                    }}
                    disabled={!fileSource}
                >
                    Load microprint
                </button>
            </div>
        </div>
    )
  
}