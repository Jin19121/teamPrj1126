# ✈️ MyTravel

> 여행 상품 예약부터 일정 관리, 가계부까지 — 여행의 모든 것을 한 곳에서.

---

## 📋 목차

1. [프로젝트 개요](#-프로젝트-개요)
2. [기술 스택](#️-기술-스택)
3. [권한 구조](#-권한-구조)
4. [주요 기능](#-주요-기능)
   - [1. 회원](#1-회원)
   - [2. 투어 상품](#2-투어-상품)
   - [3. 결제](#3-결제)
   - [4. 내 여행 (Plan)](#4-내-여행-plan)
   - [5. 내 지갑 (Wallet)](#5-내-지갑-wallet)
   - [6. 커뮤니티](#6-커뮤니티)
   - [7. 공지사항](#7-공지사항)
   - [8. 고객센터 (CS)](#8-고객센터-cs)
   - [9. 관리자](#9-관리자)
5. [프로젝트 구조](#️-프로젝트-구조)
6. [실행 방법](#️-실행-방법)
7. [주요 DB 테이블](#️-주요-db-테이블)
8. [개발팀](#-개발팀)

---

## 📌 프로젝트 개요

**MyTravel**은 여행을 계획하고, 투어 상품을 구매하며, 지출을 관리할 수 있는 통합 여행 플랫폼입니다.
파트너 기업이 투어 상품을 등록하면 일반 회원이 탐색·결제하고, 결제 내역을 내 여행 일정과 지갑에 자동으로 연동할 수 있습니다.

---

## 🛠️ 기술 스택

### Backend
| 항목 | 기술 |
|------|------|
| 언어 / 런타임 | Java 21 (Preview), Spring Boot 3.3.6 |
| ORM | MyBatis 3.0.3 |
| 데이터베이스 | MariaDB |
| 인증 | JWT (Spring OAuth2 Resource Server, RSA 키쌍) |
| 파일 스토리지 | AWS S3 (ap-northeast-2) |
| 엑셀 처리 | Apache POI 5.2.3 |

### Frontend
| 항목 | 기술 |
|------|------|
| 프레임워크 | React 18 + Vite |
| UI 라이브러리 | Chakra UI v3 |
| 라우팅 | React Router v6 |
| HTTP 클라이언트 | Axios (JWT 인터셉터 적용) |
| 지도 | Google Maps API (`@react-google-maps/api`, `use-places-autocomplete`) |
| 이미지 슬라이더 | Swiper, react-slick |
| 날짜 | react-calendar, moment.js |

### 외부 서비스
| 항목 | 기술 |
|------|------|
| 간편결제 | PortOne V2 (KakaoPay, TossPay) |
| 소셜 로그인 | Kakao OAuth 2.0 |

---

## 👥 권한 구조

```
admin   → 전체 관리 (회원·파트너·결제·고객센터)
partner → 투어 상품 등록·수정·삭제
member  → 투어 구매, 일정·지갑 관리, 커뮤니티 활동
```

---

## 🔑 주요 기능

### 1. 회원
- 이메일 기반 회원가입 / 로그인
- **카카오 소셜 로그인** — 기존 계정 없을 시 자동 가입 플로우
- 닉네임·비밀번호·프로필 사진 수정 (S3 업로드)
- 마이페이지 — 결제 내역, 등록 상품, 커뮤니티 글 관리

### 2. 투어 상품
- 파트너사가 이미지 포함 상품 등록·수정·삭제 (비활성화 처리)
- 박스형 / 목록형 뷰 전환, 다중 조건 검색
- 별점 기반 후기 시스템 — 결제 이력이 있는 회원만 후기 작성 가능
- 장바구니에 여행 날짜(시작·종료)와 함께 담기

### 3. 결제
- PortOne V2 연동 — KakaoPay / TossPay 선택 결제
- 결제 완료 후 **내 지갑** 및 **내 여행**에 원클릭 추가

### 4. 내 여행 (Plan)
- 여행 제목·목적지·기간 + 일정별 세부 필드(날짜·시간·장소·메모) 관리
- **Google Maps** 장소 검색 및 마커 표시 (Add / Edit / View 분리 컴포넌트)
- 달력 UI로 날짜별 일정 시각화, 상단 고정(Pin) 기능
- **엑셀(.xlsx) 다운로드** (Apache POI)

### 5. 내 지갑 (Wallet)
- 날짜·카테고리·사용처·수입/지출·결제방식·메모 입력
- 월별 탭, 카테고리별 탭, 달력 날짜 필터링
- 항목 다중 선택 후 일괄 삭제
- 결제 연동 시 `payment_detail_id`로 이력 추적

### 6. 커뮤니티
- 게시글 CRUD + 이미지 다중 첨부 (S3)
- 댓글 CRUD, 좋아요 토글, 조회수 카운트
- 제목·본문·작성자 검색, 페이지네이션

### 7. 공지사항
- 관리자 전용 작성·수정·삭제
- 좋아요·조회수

### 8. 고객센터 (CS)
- **FAQ** — 관리자 등록, 질문/답변 검색
- **문의 게시판** — 비밀글 설정, 카테고리 분류
- 관리자 답변 기능, 미답변 필터링

### 9. 관리자
- 회원 목록 조회·수정·탈퇴, 파트너 권한 부여
- 전체 결제 내역 조회·검색
- 고객센터 문의 답변 관리

---

## 🗂️ 프로젝트 구조

```
project-root/
├── be/                          # Spring Boot 백엔드
│   └── src/main/java/com/example/be/
│       ├── config/              # Security, S3, JWT 설정
│       ├── controller/          # REST API 엔드포인트
│       ├── service/             # 비즈니스 로직
│       ├── mapper/              # MyBatis 매퍼 (Annotation SQL)
│       └── dto/                 # 데이터 전송 객체
│
├── fe/                          # React 프론트엔드
│   └── src/
│       ├── components/          # 공통 컴포넌트 (UI, Image, context 등)
│       └── page/                # 페이지별 컴포넌트
│           ├── tour/            # 투어 상품
│           ├── plan/            # 내 여행 + Google Maps
│           ├── wallet/          # 내 지갑
│           ├── community/       # 커뮤니티
│           ├── notice/          # 공지사항
│           ├── cs/              # 고객센터
│           ├── member/          # 회원 관리
│           ├── payment/         # 결제 / 장바구니
│           └── admin/           # 관리자
│
└── sql/                         # 테이블 DDL 스크립트
```

---

## ⚙️ 실행 방법

### 사전 준비
- Java 21, Node.js 18+
- MariaDB 데이터베이스 생성 및 `sql/` 스크립트 실행
- AWS S3 버킷 생성

### 백엔드 설정

`be/src/main/resources/secret/custom.properties` 파일 생성:

```properties
spring.datasource.url=jdbc:mariadb://localhost:3306/{DB명}
spring.datasource.username={유저명}
spring.datasource.password={비밀번호}

aws.access.key={AWS_ACCESS_KEY}
aws.secret.key={AWS_SECRET_KEY}
bucket.name={S3_BUCKET_NAME}
image.src.prefix=https://{버킷명}.s3.ap-northeast-2.amazonaws.com/teamPrj1126
```

RSA 키쌍을 `be/src/main/resources/secret/` 디렉터리에 `app.pub`, `app.key`로 배치.

```bash
cd be
./gradlew bootRun
# → http://localhost:8080
```

### 프론트엔드 설정

`fe/.env` 파일 생성:

```env
VITE_GOOGLE_API_KEY=...
VITE_KAKAO_LOGIN_API_KEY=...
VITE_STORE_ID=...
VITE_KAKAOPAY_CHANNEL_KEY=...
VITE_TOSSPAY_CHANNEL_KEY=...
```

```bash
cd fe
npm install
npm run dev
# → http://localhost:5173
```

---

## 🗃️ 주요 DB 테이블

| 테이블 | 설명 |
|--------|------|
| `member` | 회원 (이메일 PK, 카카오 여부) |
| `auth` | 권한 (admin / partner) |
| `tour` | 투어 상품 |
| `tour_img` | 상품 이미지 |
| `tour_cart` | 장바구니 (날짜 포함) |
| `tour_review` | 후기 (결제 기반) |
| `tour_review_img` | 후기 이미지 |
| `payment` | 결제 헤더 |
| `payment_detail` | 결제 상세 (상품별) |
| `plan` | 여행 일정 헤더 |
| `plan_field` | 일정 세부 항목 (Google Place ID 포함) |
| `wallet` | 지갑 내역 |
| `community` | 커뮤니티 게시글 |
| `community_comment` | 댓글 |
| `community_like` | 좋아요 |
| `notice` | 공지사항 |
| `faq` | 자주 묻는 질문 |
| `inquiry` | 문의 게시글 |
| `inquiry_answer` | 문의 답변 |

---

## 👨‍💻 개발팀

| 이름 | 역할 |
|------|------|
| 김지민 | 아키텍처 설계, 풀스택 개발 |
| 민재원 | 풀스택 개발 |
| 임현정 | UI 총괄, 풀스택 개발 |

> 이 프로젝트는 포트폴리오 목적으로 제작되었습니다.
