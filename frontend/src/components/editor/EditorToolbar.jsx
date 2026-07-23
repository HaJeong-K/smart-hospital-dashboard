import { useRef } from "react";

import {
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
    Square,
    PenTool,
    Minus,
    DoorOpen,
    RectangleHorizontal,
    Footprints,
    Expand,
    ArrowUpDown,
    MoveUpRight,
} from "lucide-react";

function EditorToolbar({

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

    drawMode,

    setDrawMode,

    groupSelect,

    setGroupSelect,

}) {

    const jsonInputRef = useRef(null);

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

            ".editor-svg"

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

            {/* 방 생성 모드 — "사각형"이 기본값. 클릭+드래그 한 번으로 방을 즉시 만든다(draw.io
                스타일). 기존처럼 점을 하나씩 찍어 자유 형태로 그리고 싶을 때는 "다각형"으로
                전환한다 (2026-07-22 피드백 — 더 간편한 평면도 편집). */}
            <div className="toolbar-group">

                <button

                    className={`toolbar-btn ${drawMode === "rect" ? "active" : ""}`}

                    onClick={() => setDrawMode("rect")}

                    title="클릭+드래그로 사각형 방을 바로 생성합니다"

                >

                    <Square size={18} />

                    사각형

                </button>

                <button

                    className={`toolbar-btn ${drawMode === "polygon" ? "active" : ""}`}

                    onClick={() => setDrawMode("polygon")}

                    title="점을 하나씩 찍어 자유 형태의 방을 그립니다"

                >

                    <PenTool size={18} />

                    다각형

                </button>

                <button

                    className={`toolbar-btn ${drawMode === "wall" ? "active" : ""}`}

                    onClick={() => setDrawMode("wall")}

                    title="점을 찍어 벽을 그립니다 (더블클릭으로 완료, 45도 자동 정렬)"

                >

                    <Minus size={18} />

                    벽

                </button>

                <button

                    className={`toolbar-btn ${drawMode === "wallRect" ? "active" : ""}`}

                    onClick={() => setDrawMode("wallRect")}

                    title="클릭+드래그로 사각형 벽(4변)을 한 번에 생성합니다"

                >

                    <RectangleHorizontal size={18} />

                    사각형 벽

                </button>

                <button

                    className={`toolbar-btn ${drawMode === "door" ? "active" : ""}`}

                    onClick={() => setDrawMode("door")}

                    title="벽 위를 클릭하면 그 지점에 문이 생성됩니다"

                >

                    <DoorOpen size={18} />

                    문

                </button>

                <button

                    className={`toolbar-btn ${drawMode === "stairs" ? "active" : ""}`}

                    onClick={() => setDrawMode("stairs")}

                    title="클릭+드래그로 계단 심볼을 바로 놓습니다 (문처럼 방과 무관한 구조 심볼)"

                >

                    <Footprints size={18} />

                    계단

                </button>

                <button

                    className={`toolbar-btn ${drawMode === "elevator" ? "active" : ""}`}

                    onClick={() => setDrawMode("elevator")}

                    title="클릭+드래그로 엘리베이터 심볼을 바로 놓습니다 (문처럼 방과 무관한 구조 심볼)"

                >

                    <ArrowUpDown size={18} />

                    엘리베이터

                </button>

                <button

                    className={`toolbar-btn ${drawMode === "escalator" ? "active" : ""}`}

                    onClick={() => setDrawMode("escalator")}

                    title="클릭+드래그로 에스컬레이터 심볼을 바로 놓습니다 (문처럼 방과 무관한 구조 심볼)"

                >

                    <MoveUpRight size={18} />

                    에스컬레이터

                </button>

            </div>

            <div className="toolbar-group">

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

                <button

                    className={`toolbar-btn ${groupSelect ? "active" : ""}`}

                    onClick={() => setGroupSelect(!groupSelect)}

                    title="배치도 전체(방+벽+문)를 감싸는 모서리 핸들을 표시합니다 — 드래그하면 전체가 비율대로 확대/축소됩니다"

                >

                    <Expand size={18} />

                    전체 선택

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