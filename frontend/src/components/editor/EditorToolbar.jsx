import { useRef } from "react";

import {
    Upload,
    Save,
    FolderOpen,
    Undo2,
    Redo2,
    Grid2X2,
    Magnet,
    ZoomIn,
    ZoomOut,
    Download,
    Trash2,
} from "lucide-react";

function EditorToolbar({

    setBackground,

    rooms,

    setRooms,

    zoom,

    setZoom,

    grid,

    setGrid,

    snap,

    setSnap,

    onUndo,

    onRedo,

}) {

    const imageInputRef = useRef(null);

    const jsonInputRef = useRef(null);

    const uploadImage = (e) => {

        const file = e.target.files?.[0];

        if (!file) return;

        setBackground(

            URL.createObjectURL(file)

        );

    };

    const saveJson = () => {

        const blob = new Blob(

            [

                JSON.stringify({

                    version: "1.0",

                    width: 1000,

                    height: 700,

                    rooms,

                }, null, 4),

            ],

            {

                type: "application/json",

            }

        );

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");

        a.href = url;

        a.download = "hospital.config.json";

        a.click();

        URL.revokeObjectURL(url);

    };

    const loadJson = (e) => {

        const file = e.target.files?.[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {

            try {

                const json = JSON.parse(reader.result);

                setRooms(json.rooms ?? []);

            }

            catch {

                alert("올바른 JSON 파일이 아닙니다.");

            }

        };

        reader.readAsText(file);

    };

    const exportSvg = () => {

        const svg = document.querySelector(

            ".editor-canvas svg"

        );

        if (!svg) return;

        const blob = new Blob(

            [svg.outerHTML],

            {

                type: "image/svg+xml",

            }

        );

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");

        a.href = url;

        a.download = "floor.svg";

        a.click();

        URL.revokeObjectURL(url);

    };

    const clearRooms = () => {

        if (

            !window.confirm(

                "모든 병실을 삭제하시겠습니까?"

            )

        ) {

            return;

        }

        setRooms([]);

    };

    return (

        <div className="editor-toolbar">

            <div className="toolbar-group">

                <button

                    className="toolbar-btn"

                    onClick={() => imageInputRef.current.click()}

                >

                    <Upload size={18} />

                    PNG 업로드

                </button>

                <input

                    hidden

                    ref={imageInputRef}

                    type="file"

                    accept="image/*"

                    onChange={uploadImage}

                />

                <button

                    className="toolbar-btn"

                    onClick={() => jsonInputRef.current.click()}

                >

                    <FolderOpen size={18} />

                    JSON

                </button>

                <input

                    hidden

                    ref={jsonInputRef}

                    type="file"

                    accept=".json"

                    onChange={loadJson}

                />

                <button

                    className="toolbar-btn"

                    onClick={saveJson}

                >

                    <Save size={18} />

                    저장

                </button>

                <button

                    className="toolbar-btn"

                    onClick={exportSvg}

                >

                    <Download size={18} />

                    SVG

                </button>

            </div>

            <div className="toolbar-group">

                <button

                    className="toolbar-btn"

                    onClick={onUndo}

                >

                    <Undo2 size={18} />

                </button>

                <button

                    className="toolbar-btn"

                    onClick={onRedo}

                >

                    <Redo2 size={18} />

                </button>

                <button

                    className={`toolbar-btn ${grid ? "active" : ""}`}

                    onClick={() => setGrid(!grid)}

                >

                    <Grid2X2 size={18} />

                    Grid

                </button>

                <button

                    className={`toolbar-btn ${snap ? "active" : ""}`}

                    onClick={() => setSnap(!snap)}

                >

                    <Magnet size={18} />

                    Snap

                </button>

            </div>

            <div className="toolbar-group">

                <button

                    className="toolbar-btn"

                    onClick={() =>

                        setZoom(

                            Math.max(

                                20,

                                zoom - 10

                            )

                        )

                    }

                >

                    <ZoomOut size={18} />

                </button>

                <span className="zoom-text">

                    {zoom}%

                </span>

                <button

                    className="toolbar-btn"

                    onClick={() =>

                        setZoom(

                            Math.min(

                                500,

                                zoom + 10

                            )

                        )

                    }

                >

                    <ZoomIn size={18} />

                </button>

                <button

                    className="toolbar-btn danger"

                    onClick={clearRooms}

                >

                    <Trash2 size={18} />

                    초기화

                </button>

            </div>

        </div>

    );

}

export default EditorToolbar;