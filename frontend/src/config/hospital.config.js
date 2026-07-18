import { buildSeedRooms } from "../data/floorsData";

// 실제 평면도 이미지를 업로드하면 어떻게 보이는지 미리 확인할 수 있도록, 3층에는
// 샘플 평면도(외벽/방 구획/문/복도 해칭/방위·축척 표시가 있는 건축 도면 스타일 SVG)를
// 배경 이미지로 미리 넣어둔다. 실제로는 병원관리 > 로고/평면도 업로드에서 실사진이나
// PDF에서 변환한 이미지를 올리면 이 자리를 그대로 대체한다 (2026-07-18 피드백, T58).
const FLOOR3_SAMPLE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700">
  <rect x="0" y="0" width="1000" height="700" fill="#eef2f7"/>
  <rect x="0" y="0" width="1000" height="700" fill="none" stroke="#c7d2e0" stroke-width="2"/>
  <rect x="16" y="16" width="968" height="668" fill="none" stroke="#94a3b8" stroke-width="8"/>
  <rect x="44" y="36" width="142" height="96" fill="none" stroke="#94a3b8" stroke-width="6"/>
  <rect x="194" y="36" width="142" height="96" fill="none" stroke="#94a3b8" stroke-width="6"/>
  <rect x="344" y="36" width="142" height="96" fill="none" stroke="#94a3b8" stroke-width="6"/>
  <rect x="494" y="36" width="172" height="110" fill="none" stroke="#94a3b8" stroke-width="6"/>
  <rect x="674" y="36" width="272" height="278" fill="none" stroke="#94a3b8" stroke-width="6"/>
  <line x1="810" y1="36" x2="810" y2="314" stroke="#c7d2e0" stroke-width="2" stroke-dasharray="6 6"/>
  <rect x="44" y="162" width="162" height="96" fill="none" stroke="#94a3b8" stroke-width="6"/>
  <rect x="214" y="162" width="452" height="68" fill="none" stroke="#94a3b8" stroke-width="6"/>
  <pattern id="hatch" width="10" height="10" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
    <line x1="0" y1="0" x2="0" y2="10" stroke="#c7d2e0" stroke-width="2"/>
  </pattern>
  <rect x="214" y="162" width="452" height="68" fill="url(#hatch)"/>
  <path d="M 186 84 A 20 20 0 0 1 206 104" fill="none" stroke="#94a3b8" stroke-width="3"/>
  <path d="M 336 84 A 20 20 0 0 1 356 104" fill="none" stroke="#94a3b8" stroke-width="3"/>
  <path d="M 486 84 A 20 20 0 0 1 506 104" fill="none" stroke="#94a3b8" stroke-width="3"/>
  <path d="M 206 200 A 20 20 0 0 1 226 220" fill="none" stroke="#94a3b8" stroke-width="3"/>
  <g transform="translate(920,600)">
    <circle r="34" fill="#ffffff" stroke="#c7d2e0" stroke-width="2"/>
    <path d="M0,-24 L8,10 L0,2 L-8,10 Z" fill="#64748b"/>
    <text x="0" y="-30" text-anchor="middle" font-size="14" fill="#64748b" font-weight="700">N</text>
  </g>
  <g transform="translate(60,610)">
    <line x1="0" y1="0" x2="120" y2="0" stroke="#64748b" stroke-width="3"/>
    <line x1="0" y1="-6" x2="0" y2="6" stroke="#64748b" stroke-width="3"/>
    <line x1="120" y1="-6" x2="120" y2="6" stroke="#64748b" stroke-width="3"/>
    <text x="60" y="-10" text-anchor="middle" font-size="13" fill="#64748b">10m</text>
  </g>
  <text x="500" y="560" text-anchor="middle" font-size="22" fill="#475569" font-weight="800">3F 평면도 (샘플 이미지)</text>
  <text x="500" y="586" text-anchor="middle" font-size="13.5" fill="#94a3b8">실제 평면도 이미지를 업로드하면 이 배경 위에 병실 배치가 표시됩니다.</text>
</svg>
`.trim();

const FLOOR3_SAMPLE_SRC = `data:image/svg+xml;utf8,${encodeURIComponent(FLOOR3_SAMPLE_SVG)}`;

// 초기 시드 데이터. 실제 운영 시에는 이 구조(또는 동일한 형태의 API 응답)로 교체하면 되고,
// 화면/이벤트 처리 로직은 병원이 바뀌어도 변경되지 않는다.
// store/useDashboardStore.js 가 이 값을 초기 상태로 병합해 사용한다.
const hospitalConfig = {
    hospital: {
        id: "hospital-001",
        name: "스마트요양병원",
        building: "본관",
    },

    floors: [
        {
            id: "1F",
            name: "1F",
            floorMap: { type: "image", src: null, width: 1920, height: 1080 },
            rooms: buildSeedRooms("1F"),
        },
        {
            id: "2F",
            name: "2F",
            floorMap: { type: "image", src: null, width: 1920, height: 1080 },
            rooms: buildSeedRooms("2F"),
        },
        {
            id: "3F",
            name: "3F",
            floorMap: { type: "image", src: FLOOR3_SAMPLE_SRC, width: 1920, height: 1080 },
            rooms: buildSeedRooms("3F"),
        },
    ],
};

export default hospitalConfig;
