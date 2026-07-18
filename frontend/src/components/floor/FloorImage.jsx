import { useState } from "react";

// 평면도 이미지가 없거나 로드에 실패하면(404 등) 깨진 이미지 아이콘 대신
// 은은한 격자 placeholder를 대신 표시한다.
function FloorImage({ floor }) {
    const src = floor.floorMap?.src;
    const [error, setError] = useState(false);

    if (!src || error) {
        return (
            <g>
                <rect x="0" y="0" width="1000" height="700" fill="var(--map-background)" />
                <pattern id="floor-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--border)" strokeWidth="1" />
                </pattern>
                <rect x="0" y="0" width="1000" height="700" fill="url(#floor-grid)" />
                <text
                    x="500"
                    y="360"
                    textAnchor="middle"
                    fill="var(--text-secondary)"
                    fontSize="20"
                    opacity="0.6"
                >
                    평면도 미등록 — 병원관리에서 평면도를 업로드하세요
                </text>
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
