// ⚠️ DEPRECATED — 더 이상 라우팅에서 사용되지 않는 파일입니다.
//
// 처음에는 "모니터링" 탭을 KPI 전용 화면으로 별도 분리했으나, 최종 기능 정리안에서
// "Monitoring"은 KPI + 층별/호실별 실시간 상태 + 이벤트 로그 + 환자 상세 정보 + 실시간
// 알림이 모두 합쳐진 하나의 화면이어야 하는 것으로 확인되었습니다. 그래서 이 화면의 KPI
// 패널(components/dashboard/MonitoringKpiPanel.jsx)만 떼어내 pages/Dashboard.jsx(라우트 "/")에
// 합쳤고, 이 파일과 라우트 "/monitoring"은 더 이상 쓰이지 않습니다.
//
// 이 세션에는 파일을 삭제하는 도구가 없어 내용만 비워둡니다. 실제 삭제는
// 프로젝트 폴더에서 이 파일을 직접 지우면 됩니다: frontend/src/pages/MonitoringPage.jsx
export default null;
