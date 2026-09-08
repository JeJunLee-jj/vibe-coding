/**
 * 이제준 (Lee Jejun) - NOTA Style Editorial Portfolio Script
 * Features: Scramble Text Engine, KST Clock, Spec Matrix, Work Archive, Theme Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  // ------------------------------------------------------------------------
  // 1. Data Store
  // ------------------------------------------------------------------------
  const specsData = [
    {
      id: 'SPEC_01',
      name: 'JavaScript (ES6+)',
      category: 'frontend',
      level: 'PROFICIENT',
      scope: 'Asynchronous Programming, Event Loops, DOM Engine, Web APIs',
      desc: '비동기 흐름 제어, 이벤트 위임 및 고성능 클라이언트 로직 설계'
    },
    {
      id: 'SPEC_02',
      name: 'TypeScript',
      category: 'frontend',
      level: 'ADVANCED',
      scope: 'Strict Typings, Generics, AST, Interface Segregation',
      desc: '정적 타입 시스템을 통한 대규모 애플리케이션의 런타임 안정성 보장'
    },
    {
      id: 'SPEC_03',
      name: 'React & Next.js',
      category: 'frontend',
      level: 'CORE DISCIPLINE',
      scope: 'Component Architecture, Custom Hooks, SSR/SSG, State Machines',
      desc: '선언적 UI 컴포넌트 모델 및 상태 동기화 아키텍처 구현'
    },
    {
      id: 'SPEC_04',
      name: 'HTML5 & Modern CSS',
      category: 'frontend',
      level: 'MASTERED',
      scope: 'Semantic Standards, CSS Grid, Flexbox, Micro-Animations',
      desc: '웹 표준 시맨틱 구조, 완벽한 반응형 레이아웃 및 60fps 인터랙션'
    },
    {
      id: 'SPEC_05',
      name: 'Node.js & Express',
      category: 'backend',
      level: 'EXPERIENCED',
      scope: 'RESTful Endpoints, Middleware Chains, JWT Auth, Stream Processing',
      desc: '비동기 I/O 기반의 확장성 있는 서버 API 구축 및 인증 파이프라인'
    },
    {
      id: 'SPEC_06',
      name: 'PostgreSQL & MySQL',
      category: 'backend',
      level: 'COMPETENT',
      scope: 'Relational Modeling, Indexing, Query Optimization, ACID',
      desc: '정규화된 관계형 스키마 설계 및 데이터 무결성 보장'
    },
    {
      id: 'SPEC_07',
      name: 'Python',
      category: 'backend',
      level: 'INTERMEDIATE',
      scope: 'Scripting, Data Parsing, Automation, Algorithmics',
      desc: '데이터 전처리 및 자동화 스크립트 작성'
    },
    {
      id: 'SPEC_08',
      name: 'Git & GitHub Workflow',
      category: 'tools',
      level: 'DISCIPLINED',
      scope: 'Branching Strategy, PR Reviews, Semantic Commits, CI Integration',
      desc: '체계적인 버전 관리 및 협업 워크플로우 운영'
    },
    {
      id: 'SPEC_09',
      name: 'Vite & Webpack Build',
      category: 'tools',
      level: 'PRACTICED',
      scope: 'Tree Shaking, Chunk Splitting, Fast HMR, Bundle Optimization',
      desc: '초기 로딩 시간 단축을 위한 번들링 파이프라인 최적화'
    },
    {
      id: 'SPEC_10',
      name: 'Figma & Technical Specs',
      category: 'tools',
      level: 'INTERMEDIATE',
      scope: 'Design Tokens, Wireframing, User Flow, Component Hierarchy',
      desc: '엔지니어링 관점의 UI 프로토타이핑 및 디자인 시스템 협업'
    }
  ];

  const worksData = [
    {
      id: 'WORK_01',
      index: '01',
      title: 'Nexus Campus',
      subtitle: 'All-in-One Campus Lifecycle Platform',
      category: 'fullstack',
      categoryLabel: 'FULL-STACK PLATFORM',
      period: '2024.03 — 2024.07',
      tags: ['React', 'Node.js', 'PostgreSQL', 'Express', 'Kakao Maps API'],
      summary: '천안 안서동 대학가 라이프스타일에 맞춘 인터랙티브 시간표 빌더, 캠퍼스 맛집 큐레이션 및 팀원 모집 협업 플랫폼',
      meta: {
        role: 'Lead Full-Stack Engineer',
        target: '천안 대학가 재학생 및 로컬 커뮤니티',
        architecture: 'Client-Server REST Architecture with JWT State'
      },
      details: {
        problem: '학기 초 시간표 작성의 번거로움과 대학가 주변의 분산된 학업/생활 정보로 인한 학생들의 시간 소모 문제를 해결하고자 기획되었습니다.',
        solution: '드래그 앤 드롭 기반의 인터랙티브 시간표 빌더와 위치 기반 지도 필터링을 결합하여 정보 탐색 시간을 70% 이상 단축시켰습니다.',
        troubleshooting: '다중 강의 등록 시 발생하는 렌더링 지연을 가상 상태 트리와 메모이제이션 기법을 적용하여 UI 반응 지연을 12ms 이내로 단축했습니다.',
        outcome: '교내 학생 대상 비공개 베타 테스트에서 DAU 200+ 달성 및 사용자 만족도 96% 기록'
      }
    },
    {
      id: 'WORK_02',
      index: '02',
      title: 'DevSync',
      subtitle: 'Real-time Markdown Collaboration Engine',
      category: 'webapp',
      categoryLabel: 'COLLABORATIVE APP',
      period: '2024.08 — 2024.11',
      tags: ['TypeScript', 'React', 'WebSocket', 'CodeMirror', 'CRDT'],
      summary: '브라우저 상에서 다수의 개발자가 코드 블록 런타임 및 실시간 동시 마크다운 편집을 수행할 수 있는 테크니컬 협업 에디터',
      meta: {
        role: 'Frontend & Sync Engine Engineer',
        target: '원격 개발팀 및 기술 연구 스터디',
        architecture: 'WebSocket Realtime Pipeline with CRDT Resolution'
      },
      details: {
        problem: '원격 협업 시 문서 작성과 코드 테스트가 분리되어 발생하는 컨텍스트 스위칭 비용을 최소화하기 위한 통합 솔루션이 필요했습니다.',
        solution: 'CRDT 기반 충돌 해결 알고리즘과 브라우저 내 코드 샌드박스를 통합하여 실시간 동시 편집과 코드 실행을 한 화면에서 처리했습니다.',
        troubleshooting: '장문 문서 편집 시 잦은 DOM 리렌더링을 방지하기 위해 가상화 뷰포트 렌더링을 구축하여 메모리 점유율을 45% 절감했습니다.',
        outcome: '실시간 데이터 전송 지연 시간(Latency) 50ms 미만 유지, Lighthouse 성능 점수 98점 달성'
      }
    },
    {
      id: 'WORK_03',
      index: '03',
      title: 'FlowTask',
      subtitle: 'Smart Productivity & Kanban Dashboard',
      category: 'productivity',
      categoryLabel: 'PRODUCTIVITY SYSTEM',
      period: '2024.12 — 2025.03',
      tags: ['JavaScript', 'HTML5 Drag & Drop', 'Chart.js', 'Web Storage API'],
      summary: '우선순위 자동 분석 알고리즘과 인터랙티브 칸반 보드를 결합하여 업무 몰입도를 극대화하는 생산성 대시보드',
      meta: {
        role: 'UI Interaction & Data Flow Engineer',
        target: '개인 개발자 및 소규모 프로젝트 팀',
        architecture: 'Offline-First Client Architecture with LocalStorage'
      },
      details: {
        problem: '기존 일정 관리 도구들의 무거운 로딩과 복잡한 설정을 탈피하여, 즉각적이고 직관적인 태스크 우선순위 재배치가 요구되었습니다.',
        solution: '순수 HTML5 Drag & Drop API와 계산된 가중치 알고리즘을 결합하여 초경량 고성능 칸반 보드를 설계했습니다.',
        troubleshooting: '모바일 터치 환경에서의 드래그 앤 드롭 미지원을 해결하기 위해 터치 이벤트 제스처 폴리필을 자체 구현했습니다.',
        outcome: '초기 번들 사이즈 15KB 이하 유지 및 로컬 스토리지 데이터 무손실 동기화 달성'
      }
    },
    {
      id: 'WORK_04',
      index: '04',
      title: 'Artisan Engine',
      subtitle: 'High-Performance Editorial Framework',
      category: 'webapp',
      categoryLabel: 'UI/UX SYSTEM',
      period: '2025.04 — 2025.07',
      tags: ['Vanilla JS', 'Modern CSS', 'Scramble Engine', 'Print Media'],
      summary: '외부 프레임워크 의존성 없이 순수 Vanilla 기술만으로 구현된 하이엔드 에디토리얼 테크 포트폴리오 엔진',
      meta: {
        role: 'Sole Architect & Designer',
        target: '기술 포트폴리오 & 크리에이티브 아카이브',
        architecture: 'Zero-Dependency Vanilla Architecture'
      },
      details: {
        problem: '무거운 서드파티 라이브러리로 인한 웹사이트 성능 저하와 전형적인 AI 생성형 템플릿의 미학적 한계를 극복하고자 했습니다.',
        solution: 'CSS Design Awards 수상작의 타이포그래피 미학과 순수 JavaScript 기반의 텍스트 스크램블 효과를 결합했습니다.',
        troubleshooting: '모든 기기 해상도에서 픽셀 완벽성을 보장하기 위해 rem 단위 기반의 정밀 레이아웃 시스템을 정립했습니다.',
        outcome: '초기 로딩 속도 0.15초 달성 및 인쇄 시 A4 이력서 규격 완벽 대응'
      }
    }
  ];

  // ------------------------------------------------------------------------
  // 2. Scramble Text Engine (High-End Editorial Micro-Interaction)
  // ------------------------------------------------------------------------
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~|}{[]';

  function runScramble(element) {
    if (element.dataset.isScrambling === 'true') return;
    element.dataset.isScrambling = 'true';

    const originalText = element.dataset.scramble || element.textContent.trim();
    let iteration = 0;
    const maxIterations = originalText.length * 2;

    const interval = setInterval(() => {
      element.textContent = originalText
        .split('')
        .map((char, index) => {
          if (char === ' ' || char === '\n' || char === '—' || char === '/' || char === '[' || char === ']' || char === '↑') {
            return char;
          }
          if (index < iteration / 2) {
            return originalText[index];
          }
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');

      if (iteration >= maxIterations) {
        clearInterval(interval);
        element.textContent = originalText;
        element.dataset.isScrambling = 'false';
      }
      iteration += 1;
    }, 25);
  }

  document.querySelectorAll('.scramble-hover').forEach(el => {
    el.addEventListener('mouseenter', () => runScramble(el));
  });

  // ------------------------------------------------------------------------
  // 3. Realtime KST Clock
  // ------------------------------------------------------------------------
  function updateKstClock() {
    const clockEl = document.getElementById('kst-clock');
    if (!clockEl) return;
    const now = new Date();
    // UTC+9 for KST
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const kstDate = new Date(utc + (3600000 * 9));
    
    const hours = String(kstDate.getHours()).padStart(2, '0');
    const mins = String(kstDate.getMinutes()).padStart(2, '0');
    const secs = String(kstDate.getSeconds()).padStart(2, '0');
    clockEl.textContent = `KST ${hours}:${mins}:${secs}`;
  }
  setInterval(updateKstClock, 1000);
  updateKstClock();

  // ------------------------------------------------------------------------
  // 4. Render Specifications Matrix
  // ------------------------------------------------------------------------
  const specsContainer = document.getElementById('specs-matrix-container');
  const specTabBtns = document.querySelectorAll('.specs-tab-btn');

  function renderSpecs(category = 'all') {
    if (!specsContainer) return;
    specsContainer.innerHTML = '';

    const filtered = category === 'all'
      ? specsData
      : specsData.filter(s => s.category === category);

    filtered.forEach(spec => {
      const card = document.createElement('div');
      card.className = 'spec-matrix-card';
      card.innerHTML = `
        <div class="matrix-card-top">
          <div>
            <h4 class="matrix-card-name">${spec.name}</h4>
            <span class="matrix-card-index">${spec.id} // ${spec.level}</span>
          </div>
          <span class="tag-pill">${spec.category.toUpperCase()}</span>
        </div>
        <p class="matrix-card-desc">${spec.desc}</p>
        <div class="matrix-card-footer">
          <span>SCOPE: ${spec.scope}</span>
        </div>
      `;
      specsContainer.appendChild(card);
    });
  }

  specTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      specTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderSpecs(btn.dataset.specCat);
    });
  });

  renderSpecs('all');

  // ------------------------------------------------------------------------
  // 5. Render Works Archive & Modal
  // ------------------------------------------------------------------------
  const worksContainer = document.getElementById('works-archive-container');
  const workFilterBtns = document.querySelectorAll('.work-filter-btn');
  const modalOverlay = document.getElementById('work-modal-overlay');
  const modalContent = document.getElementById('modal-content-container');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  function renderWorks(filter = 'all') {
    if (!worksContainer) return;
    worksContainer.innerHTML = '';

    const filtered = filter === 'all'
      ? worksData
      : worksData.filter(w => w.category === filter);

    filtered.forEach(work => {
      const card = document.createElement('div');
      card.className = 'work-entry-card';
      card.innerHTML = `
        <div class="work-entry-index">[${work.index}]</div>
        <div class="work-entry-main">
          <span class="work-entry-category">${work.categoryLabel} // ${work.period}</span>
          <h3 class="work-entry-title">${work.title} <span class="serif-italic" style="font-size: 1.1rem; color: var(--text-muted); font-weight: normal;">— ${work.subtitle}</span></h3>
          <p class="work-entry-desc">${work.summary}</p>
          <div class="work-entry-tags">
            ${work.tags.map(t => `<span class="work-entry-tech-tag">${t}</span>`).join('')}
          </div>
        </div>
        <div class="work-entry-side">
          <div class="work-side-meta">
            <span>ROLE: ${work.meta.role}</span>
            <span>TARGET: ${work.meta.target}</span>
            <span>ARCH: ${work.meta.architecture}</span>
          </div>
          <div class="work-side-actions">
            <button class="btn-work-detail" data-work-id="${work.id}">
              [ VIEW CASE STUDY & SPECS ]
            </button>
          </div>
        </div>
      `;
      worksContainer.appendChild(card);
    });

    document.querySelectorAll('.btn-work-detail').forEach(btn => {
      btn.addEventListener('click', () => {
        openWorkModal(btn.dataset.workId);
      });
    });
  }

  workFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      workFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderWorks(btn.dataset.filter);
    });
  });

  function openWorkModal(workId) {
    const work = worksData.find(w => w.id === workId);
    if (!work) return;

    modalContent.innerHTML = `
      <div style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--accent-amber); margin-bottom: 0.75rem;">
        SPEC_CASE_STUDY // ${work.id} — ${work.period}
      </div>

      <h2 style="font-size: 2.2rem; font-weight: 700; color: var(--text-pure); margin-bottom: 0.25rem;">
        ${work.title}
      </h2>
      <p class="serif-italic" style="font-size: 1.25rem; color: var(--text-muted); margin-bottom: 2rem;">
        ${work.subtitle}
      </p>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; border-top: 1px solid var(--border-main); border-bottom: 1px solid var(--border-main); padding: 1.25rem 0; margin-bottom: 2rem; font-family: var(--font-mono); font-size: 0.78rem;">
        <div>
          <span style="color: var(--text-dim); display: block; margin-bottom: 0.2rem;">ROLE</span>
          <strong style="color: var(--text-pure);">${work.meta.role}</strong>
        </div>
        <div>
          <span style="color: var(--text-dim); display: block; margin-bottom: 0.2rem;">CATEGORY</span>
          <strong style="color: var(--text-pure);">${work.categoryLabel}</strong>
        </div>
        <div>
          <span style="color: var(--text-dim); display: block; margin-bottom: 0.2rem;">TIMELINE</span>
          <strong style="color: var(--text-pure);">${work.period}</strong>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 1.75rem;">
        <div>
          <h4 style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-dim); text-transform: uppercase; margin-bottom: 0.4rem;">
            01 // Problem Definition
          </h4>
          <p style="color: var(--text-main); font-size: 0.96rem; line-height: 1.7;">
            ${work.details.problem}
          </p>
        </div>

        <div>
          <h4 style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-dim); text-transform: uppercase; margin-bottom: 0.4rem;">
            02 // Engineered Solution
          </h4>
          <p style="color: var(--text-main); font-size: 0.96rem; line-height: 1.7;">
            ${work.details.solution}
          </p>
        </div>

        <div style="background: var(--bg-surface); border: 1px solid var(--border-main); padding: 1.25rem; border-radius: var(--radius-xs);">
          <h4 style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--accent-blue); text-transform: uppercase; margin-bottom: 0.4rem;">
            03 // Troubleshooting & Technical Challenge
          </h4>
          <p style="color: var(--text-pure); font-size: 0.92rem; line-height: 1.65;">
            ${work.details.troubleshooting}
          </p>
        </div>

        <div>
          <h4 style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-dim); text-transform: uppercase; margin-bottom: 0.4rem;">
            04 // Measurable Impact
          </h4>
          <p style="color: var(--text-main); font-size: 0.96rem; line-height: 1.7;">
            ${work.details.outcome}
          </p>
        </div>
      </div>

      <div style="margin-top: 2.5rem; display: flex; gap: 1rem; border-top: 1px solid var(--border-subtle); padding-top: 1.5rem;">
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" class="btn-editorial-primary" style="flex: 1; justify-content: center;">
          <span>SOURCE REPOSITORY</span>
          <i class="fa-brands fa-github"></i>
        </a>
      </div>
    `;

    modalOverlay.classList.add('active');
  }

  modalCloseBtn.addEventListener('click', () => {
    modalOverlay.classList.remove('active');
  });

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.classList.remove('active');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
      modalOverlay.classList.remove('active');
    }
  });

  renderWorks('all');

  // ------------------------------------------------------------------------
  // 6. Toast Notification
  // ------------------------------------------------------------------------
  function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'editorial-toast';
    toast.innerHTML = `<span class="indicator-dot"></span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 3500);
  }

  // ------------------------------------------------------------------------
  // 7. Clipboard Copy
  // ------------------------------------------------------------------------
  function copyText(text, label = 'Information') {
    navigator.clipboard.writeText(text).then(() => {
      showToast(`${label} copied to clipboard: ${text}`);
    }).catch(() => {
      showToast(`Copy failed: ${text}`);
    });
  }

  const heroCopyPhoneBtn = document.getElementById('btn-hero-copy-phone');
  if (heroCopyPhoneBtn) {
    heroCopyPhoneBtn.addEventListener('click', () => {
      copyText('010-4677-2417', 'Direct Phone');
    });
  }

  const termPhoneBtn = document.getElementById('terminal-phone-btn');
  if (termPhoneBtn) {
    termPhoneBtn.addEventListener('click', () => {
      copyText('010-4677-2417', 'Phone Number');
    });
  }

  const termEmailBtn = document.getElementById('terminal-email-btn');
  if (termEmailBtn) {
    termEmailBtn.addEventListener('click', () => {
      copyText('jejun.lee@example.com', 'Email Address');
    });
  }

  // ------------------------------------------------------------------------
  // 8. Theme Engine (Obsidian Dark / Editorial Paper Light)
  // ------------------------------------------------------------------------
  const themeToggleBtn = document.getElementById('btn-theme-toggle');
  const savedTheme = localStorage.getItem('nota_theme');

  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('light-theme');
      const isLight = document.body.classList.contains('light-theme');
      localStorage.setItem('nota_theme', isLight ? 'light' : 'dark');
      showToast(`Theme switched to ${isLight ? 'Editorial Paper (Light)' : 'Obsidian Carbon (Dark)'}`);
    });
  }

  // ------------------------------------------------------------------------
  // 9. Print Resume
  // ------------------------------------------------------------------------
  const printBtn = document.getElementById('btn-print-resume');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // ------------------------------------------------------------------------
  // 10. Contact Form Transmit
  // ------------------------------------------------------------------------
  const contactForm = document.getElementById('editorial-contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('input-name').value;
      const email = document.getElementById('input-email').value;
      const subject = document.getElementById('input-subject').value;
      const message = document.getElementById('input-message').value;

      const logs = JSON.parse(localStorage.getItem('nota_messages') || '[]');
      logs.push({ name, email, subject, message, timestamp: new Date().toISOString() });
      localStorage.setItem('nota_messages', JSON.stringify(logs));

      showToast(`Transmission received from ${name}. We will respond promptly.`);
      contactForm.reset();
    });
  }

  // Year
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});
