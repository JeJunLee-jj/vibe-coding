# AGENTS.md — 이제준 포트폴리오 워크스페이스

이 파일은 이 폴더에서 일하는 모든 AI 에이전트가 따라야 할 기준입니다.
Antigravity·Cursor·Claude Code가 자동으로 읽습니다.

---

## 1. 이 프로젝트는 무엇인가

상명대학교 천안캠퍼스 **조경학과 3학년 이제준**의 개인 포트폴리오입니다.
현재 완성된 것은 **공개용 포트폴리오 웹페이지**(`portfolio.html`)이고,
지금 만들려는 것은 그 내용을 관리·조망하는 **대시보드**입니다.

작업 지시는 `docs/DASHBOARD.md`에 있습니다.

---

## 2. 반드시 지킬 것 (Hard Rules)

### 2-1. 인물 서술
- 학과는 **조경학과**입니다. '그린스마트시티학과'는 과거 문서에 남아 있던 **오기**이며 이미 정정했습니다. 되돌리지 마세요.
- 본인을 **'엔지니어' · '개발자'로 지칭하지 마세요.** '조경학과 학생'으로 쓰고, 웹 작업은 '구현'으로 서술합니다.
  - ❌ `프론트엔드 엔지니어 이제준입니다`
  - ✅ `조경 설계 · 공간 데이터 시각화` / `도시의 녹지와 공간을 설계하고, 그 데이터를 화면으로 옮깁니다`
- GitHub 주소는 `https://github.com/JeJunLee-jj` 입니다. `jejun-lee`는 존재하지 않는 계정(404)입니다.

### 2-2. 내용 무결성
- **없는 프로젝트·기술·수치를 만들지 마세요.** 모든 콘텐츠의 출처는 `data/portfolio.json`입니다.
- **수치(ms, %, KB, DAU, 점수, 기간, 면적)는 한 글자도 바꾸지 마세요.** 채용 서류에 쓰이는 값입니다.
- 화답숲의 `ownWork: true` 표시(패널 구성 · 식재 계획)는 팀 작업 중 **본인 담당 파트**라는 뜻입니다. 다른 파트를 본인 것으로 표기하지 마세요.

### 2-3. 개인정보
- 전화번호 `010-4677-2417`은 채용 담당자용입니다. **공개 배포되는 화면에 넣기 전에 반드시 사용자에게 확인**하세요.
- `내 정보.txt`, `내 정보.hwp`는 개인정보 파일입니다. 공개 저장소나 빌드 산출물에 포함하지 마세요.

---

## 3. 파일 지도

```
portfolio.html          공개용 포트폴리오 페이지 (완성) — 화면의 원본
  ├ panel.jpg           화답숲 A1 패널 (웹용 1200px)
  ├ panel_web.jpg       동일 이미지 원본
  └ panel_large.jpg     고해상도 2600px (인쇄·확대용)

data/portfolio.json     ★ 대시보드가 읽을 구조화 데이터 (단일 진실 공급원)
tools/build_data.py     portfolio.html → data/portfolio.json 재생성기

dashboard/              ← 여기에 대시보드를 만듭니다 (현재 비어 있음)

docs/DASHBOARD.md       ★ 대시보드 기획서 — 작업 지시서
PORTFOLIO.md            포트폴리오 콘텐츠 원본 + 화면 스펙 (사람이 읽는 버전)
CLAUDE.md               최초 마스터 컨텍스트 (이력·배경)
PORTFOLIO_SPEC.md       구 포트폴리오 데이터 명세

index.html              구 포트폴리오 (포켓몬 테마) — 참고용, 건드리지 마세요
script.js / style.css   구 포트폴리오 자산
4조_스마트공원_패널.ai   화답숲 원본 (Adobe Illustrator, 859MB)
```

---

## 4. 데이터 다루는 법

`data/portfolio.json`이 **단일 진실 공급원**입니다. 대시보드는 이 파일을 읽습니다.

주요 키:

| 키 | 내용 |
| :-- | :-- |
| `name` `role` `affiliation` `lead` | 인물 기본 정보 |
| `contacts[]` | `{label, href}` |
| `summary[]` | 소개 3항목 `{title, body}` |
| `metrics[]` | 핵심 지표 4개 `{value, label}` |
| `stack[]` | 티어 2개 → `groups[] {name, tech[], points[]}` |
| `projects[]` | 5건. `featured: true`가 대표작(화답숲) |
| `projects[].sections[]` | `{title, ownWork, paragraphs[], steps[], results[]}` |
| `principles[]` `faq[]` `footer[]` | 작업 원칙 / 질문 / 푸터 |

**`portfolio.html`을 수정했다면 반드시 다시 생성하세요:**

```bash
python tools/build_data.py
```

반대로 데이터를 먼저 고쳤다면 `portfolio.html`에도 같은 내용을 반영해야 둘이 어긋나지 않습니다.
어느 쪽이든 **한쪽만 고치고 끝내지 마세요.**

---

## 5. 기술 제약

- **빌드 도구 없이 동작해야 합니다.** 정적 HTML + CSS + 바닐라 JS 또는 CDN에서 불러오는 라이브러리만 씁니다. `npm install`이 필요한 구조는 피하세요.
- 로컬에서 `file://`로 열 때 `fetch('data/portfolio.json')`는 CORS로 막힙니다. 아래 서버 실행을 안내하거나, 데이터를 JS 파일로 인라인하는 방식을 쓰세요.
- **한글이 깨지지 않아야 합니다.** 파일은 UTF-8, 폰트는 한글을 지원하는 것으로.
- 밝은 테마 / 어두운 테마 모두에서 읽혀야 합니다.
- 모바일 폭 400px에서 가로 스크롤이 생기면 안 됩니다.

### 로컬 서버

```bash
python -m http.server 8931
```

Windows에서 `python`이 Microsoft Store 안내만 뜬다면 전체 경로를 쓰세요:

```
C:\Users\user\AppData\Local\Programs\Python\Python312\python.exe -m http.server 8931
```

VS Code 계열이면 `Terminal → Run Task → 포트폴리오 로컬 서버`로도 실행됩니다.

---

## 6. 작업 방식

- 수정 전에 해당 파일을 먼저 읽으세요. 특히 `portfolio.html`은 1,300줄이 넘고 인쇄 전용 CSS가 섞여 있습니다.
- `portfolio.html`의 `@media print` 블록은 **PDF 추출 기능**입니다. 화면용 스타일과 분리되어 있으니 임의로 합치지 마세요.
- 커밋 메시지와 UI 문구는 한국어로 씁니다.
