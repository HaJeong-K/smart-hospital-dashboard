// 이 파일은 pages/FloorEditor.jsx 와 내용이 중복된 죽은 코드였고,
// 내부 import 경로도 실제 존재하지 않는 "components/components/editor/..." 를 가리키는 등
// 자체적으로 깨져 있었다 (아무 곳에서도 import되지 않아 빌드는 되던 상태).
// 라우터(router/AppRouter.jsx)는 항상 pages/FloorEditor.jsx 를 사용하므로,
// 이 파일은 실수로 다시 import되더라도 동일하게 동작하도록 그쪽을 재노출만 한다.
export { default } from "../../pages/FloorEditor";
