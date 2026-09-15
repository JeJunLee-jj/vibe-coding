# 이제준 포트폴리오

상명대학교 천안캠퍼스 조경학과 3학년 이제준의 포트폴리오 워크스페이스입니다.

---

## Antigravity에서 열기

1. Antigravity 실행 → **Open New Workspace**
2. 이 폴더(`개인 포트폴리오`) 선택
3. 끝. 루트의 `AGENTS.md`를 에이전트가 자동으로 읽습니다

> 탐색기에서 `portfolio.code-workspace`를 더블클릭해도 같은 폴더가 열립니다.

열고 나서 에이전트에게 이렇게 시키면 됩니다:

```
docs/DASHBOARD.md 기획서대로 dashboard/ 안에 대시보드를 만들어줘.
데이터는 data/portfolio.json을 읽고, AGENTS.md 규칙을 지켜줘.
```

---

## 지금까지 만들어진 것

| 파일 | 설명 |
| :-- | :-- |
| `portfolio.html` | **공개용 포트폴리오 페이지 (완성)** — 프로젝트 카드 클릭 시 모달, 우측 상단 공유하기(링크 복사 / PDF 추출) |
| `data/portfolio.json` | 구조화 데이터 — 프로젝트 5건, 지표 4개, 스택 2티어, 원칙 3, 질문 2 |
| `tools/build_data.py` | `portfolio.html` → `data/portfolio.json` 재생성기 |
| `AGENTS.md` | AI 에이전트 규칙 (Antigravity·Cursor·Claude Code 공통) |
| `docs/DASHBOARD.md` | 만들려는 대시보드 기획서 |
| `dashboard/` | 대시보드가 들어갈 자리 (비어 있음) |

`index.html` · `script.js` · `style.css`는 **예전 포켓몬 테마 포트폴리오**입니다. 참고용으로 남겨 뒀습니다.

---

## 실행

```bash
python -m http.server 8931
```

- 포트폴리오 → http://localhost:8931/portfolio.html
- 대시보드 → http://localhost:8931/dashboard/

Windows에서 `python`이 Microsoft Store 안내만 뜨면 전체 경로를 쓰세요:

```
C:\Users\user\AppData\Local\Programs\Python\Python312\python.exe -m http.server 8931
```

VS Code 계열에서는 **Terminal → Run Task**에 두 작업이 등록되어 있습니다.

`portfolio.html`을 고친 뒤에는 데이터를 다시 만드세요:

```bash
python tools/build_data.py
```

---

## ⚠️ Git 상태 — 먼저 읽어 주세요

**이 폴더는 `https://github.com/JeJunLee-jj/vibe-coding` 의 로컬 클론입니다.** (브랜치 `main`)

### 1. 커밋되지 않은 변경이 있습니다

`index.html`, `script.js`, `내 정보.txt`에 학과·GitHub 주소·자기지칭 표현 정정이 반영되어 있지만 **아직 커밋 전**입니다. 새로 만든 파일들도 전부 미추적 상태입니다.

```bash
git status
```

### 2. 개인정보 파일이 Git에 추적되고 있습니다

`내 정보.txt`, `내 정보.hwp`가 **최초 커밋부터 추적되어 원격 공개 저장소에 올라가 있습니다.** `.gitignore`에 적어도 **이미 추적 중인 파일은 제외되지 않습니다.** 추적에서 빼려면:

```bash
git rm --cached "내 정보.txt" "내 정보.hwp"
```

다만 이렇게 해도 **과거 커밋에는 그대로 남습니다.** 완전히 지우려면 GitHub에서 저장소를 삭제 후 재생성하거나, 우선 **Settings → Change visibility → Private**으로 노출을 막는 편이 확실합니다.

### 3. 859MB 원본은 Git에 올리지 마세요

`4조_스마트공원_패널.ai`는 859MB입니다. GitHub 파일 상한(100MB)을 크게 넘습니다. `.gitignore`에 `*.ai`로 제외해 뒀습니다.
