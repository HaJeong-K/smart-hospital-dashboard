import { useState } from "react";

// 평면도 이미지가 없거나 로드에 실패하면(404 등) 깨진 이미지 아이콘 대신
// 은은한 격자 placeholder를 대신 표시한다.
// showGrid=false로 두면 격자 무늬 없이 배경색만 표시한다 — Monitoring(관제) 화면은
// 평면도를 "그릴 때"와 달리 격자가 시야를 어지럽히기만 해서 꺼둔다 (2026-07-22 피드백).
function FloorImage({ floor, showGrid = true }) {
    const src = floor.floorMap?.src;
    const [error, setError] = useState(false);

    if (!src || error) {
        return (
            <g>
                <rect x="0" y="0" width="1000" height="700" fill="var(--map-background)" />
                {showGrid && (
                    <>
                        <pattern id="floor-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--border)" strokeWidth="1" />
                        </pattern>
                        <rect x="0" y="0" width="1000" height="700" fill="url(#floor-grid)" />
                    </>
                )}
            </g>
        );
    }

    return (
        <image
            href={src}
            x="0"
            y="0"
            width="1000"
            height="700"
            preserveAspectRatio="none"
            onError={() => setError(true)}
        />
    );
}

export default FloorImage;
