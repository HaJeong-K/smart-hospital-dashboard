
# SCR-MON-001 화면 기획 및 설계

> 프로젝트 : 60GHz mmWave Radar 기반 스마트 병원 관제 시스템

---

# 1. 화면 목적

실시간 환자 상태와 병실 현황을 모니터링하여 이상 상황(낙상, 호흡 이상 등)을 신속하게 인지하고 대응할 수 있도록 지원한다.

---

# 2. 화면 구성

- Header
  - 시스템명
  - 현재 시간
  - 층 선택
  - 다크/라이트 모드
  - 알림

- Sidebar
  - 실시간 모니터링
  - 환자 관리
  - 알림 관리
  - 기기 관리
  - 통계
  - 설정

- Main View
  - 병실 배치도
  - 환자 상태
  - 센서 상태

- Right Panel
  - 실시간 알림
  - 이벤트 로그

---

# 3. UI 설계

## Dark Mode (기본)

- 배경 : #050A15
- 패널 : #101827
- 위험 상태 : 빨간 Glow + 점멸 효과
- 야간 관제 최적화

## Light Mode

- 밝은 배경
- 정보 가독성 향상
- 동일한 색상 규칙 유지

---

# 4. Frontend 설계

## 기술 스택

- React
- JavaScript
- Node.js Runtime

## 주요 컴포넌트

- Header
- Sidebar
- FloorMap
- RoomCard
- AlarmPanel
- PatientDetail

## 주요 기능

- 층 변경
- 병실 선택
- 실시간 상태 조회
- 다크/라이트 모드 전환
- 알림 확인

---

# 5. Backend 설계

## 기술 스택

- FastAPI
- Python
- PostgreSQL

## 주요 기능

- 로그인 인증
- 센서 데이터 수신
- AI 분석 결과 처리
- REST API 제공
- 데이터 저장 및 조회

---

# 6. 데이터 흐름

60GHz Radar

↓

FastAPI

↓

PostgreSQL

↓

REST API

↓

React Dashboard

---

# 7. API 연계

| 기능 | Method | API |
|------|--------|-----------------------|
| 로그인 | POST | /api/auth/login |
| 대시보드 | GET | /api/dashboard |
| 병실 목록 | GET | /api/rooms |
| 병실 상세 | GET | /api/rooms/{roomId} |
| 알림 조회 | GET | /api/alarms |

---

# 8. 상태 표현

| 상태 | 표시 |
|------|------|
| 정상 | 🟢 초록 |
| 주의 | 🟡 노랑 |
| 위험 | 🔴 빨강 + 점멸 |
| 오프라인 | ⚪ 회색 |

Critical 알림은 화면 최상단 고정 및 점멸 애니메이션을 적용한다.

---

# 9. 예외 처리

- 센서 연결 실패
- 서버 오류
- API 통신 실패
- JWT 인증 실패
- 데이터 없음

---

# 10. 향후 확장

- WebSocket 실시간 Push
- CCTV 연동
- AI 위험도 예측
- 모바일 관제 지원
