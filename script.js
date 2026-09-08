/**
 * LEE JEJUN (이제준) — POKÉMON-INSPIRED DEVELOPER DEX & TRAINER PORTFOLIO
 * Features:
 *  - 8-Bit Web Audio Synthesizer (Retro Pokémon Sound Effects)
 *  - 3D Hologram Trainer Card Physics (Mouse Parallax & Shine)
 *  - Gym Badges Skill Matrix (8 Master Badges)
 *  - Code-Dex Project Archive & Detail Screen Modal
 *  - Day / Night Route Theme Engine
 *  - Poke-Comms Contact & Instant Clipboard Engine
 */

document.addEventListener('DOMContentLoaded', () => {

  // ------------------------------------------------------------------------
  // 1. Data Store: 8 Gym Badges (Mastered Capabilities)
  // ------------------------------------------------------------------------
  const badgesData = [
    {
      id: 'BADGE_01',
      name: '썬더 배지 (Thunder)',
      tech: 'JavaScript & TypeScript',
      color: '#F8D030',
      icon: 'fa-bolt',
      desc: '비동기 이벤트 루프 및 정적 타입 시스템을 정밀 제어하는 번개같은 실행 속도'
    },
    {
      id: 'BADGE_02',
      name: '파이어 배지 (Fire)',
      tech: 'React & Next.js',
      color: '#F08030',
      icon: 'fa-fire-flame-curved',
      desc: '선언적 UI 컴포넌트 구조와 SSR/SSG 렌더링을 불태우는 강력한 프론트엔드 역량'
    },
    {
      id: 'BADGE_03',
      name: '워터 배지 (Water)',
      tech: 'Node.js & Express',
      color: '#6890F0',
      icon: 'fa-water',
      desc: '유연하게 흐르는 비동기 I/O 기반의 확장성 있는 서버 API 및 실시간 파이프라인'
    },
    {
      id: 'BADGE_04',
      name: '리프 배지 (Leaf)',
      tech: 'Green Smart City & Python',
      color: '#78C850',
      icon: 'fa-leaf',
      desc: '상명대학교 그린스마트시티학과 전공 지식과 결합한 데이터 분석 및 자동화'
    },
    {
      id: 'BADGE_05',
      name: '에스퍼 배지 (Psychic)',
      tech: 'PostgreSQL & MySQL',
      color: '#F85888',
      icon: 'fa-brain',
      desc: '복잡한 데이터 관계를 꿰뚫어보는 정규화된 스키마 설계와 쿼리 최적화'
    },
    {
      id: 'BADGE_06',
      name: '스틸 배지 (Steel)',
      tech: 'Git & CI/CD Pipeline',
      color: '#B8B8D0',
      icon: 'fa-shield-halved',
      desc: '빈틈없는 브랜칭 전략과 자동화 배포 파이프라인으로 구축하는 강철같은 안정성'
    },
    {
      id: 'BADGE_07',
      name: '록 배지 (Rock)',
      tech: 'HTML5 & Modern CSS3',
      color: '#B8A038',
      icon: 'fa-gem',
      desc: '흔들림 없는 웹 표준 시맨틱 마크업과 60fps 부드러운 반응형 레이아웃'
    },
    {
      id: 'BADGE_08',
      name: '드래곤 배지 (Dragon)',
      tech: 'System Architecture',
      color: '#7038F8',
      icon: 'fa-dragon',
      desc: '단일 책임 원칙(SRP)과 모듈화를 관통하는 최상위 시스템 아키텍처 설계'
    }
  ];

  // ------------------------------------------------------------------------
  // 2. Data Store: Code-Dex Archive (4 Flagship Projects)
  // ------------------------------------------------------------------------
  const dexProjectsData = [
    {
      dexNo: '#001',
      title: 'Nexus Campus',
      subtitle: '천안 대학가 올인원 라이프사이클 플랫폼',
      type: 'electric',
      typeLabel: 'ELECTRIC / TYPE',
      tags: ['React', 'Node.js', 'PostgreSQL', 'Express', 'Kakao Maps'],
      period: '2024.03 — 2024.07',
      accentColor: '#F59E0B',
      summary: '천안 안서동 대학가 라이프스타일에 맞춘 인터랙티브 시간표 빌더, 로컬 맛집 큐레이션 및 캠퍼스 팀원 모집 협업 플랫폼입니다.',
      stats: {
        attack: '95% (코드 품질 및 모듈화)',
        defense: '92% (JWT 인증 및 안정성)',
        speed: '98% (응답 지연 12ms 이내)'
      },
      details: {
        background: '학기 초 복잡한 시간표 작성과 흩어져 있는 천안 안서동 대학가의 학업/생활 정보 탐색 비용을 획기적으로 절감하기 위해 기획되었습니다.',
        solution: '드래그 앤 드롭 방식의 직관적인 시간표 빌더와 반경 기반 지도 필터링을 결합하여 탐색 소요 시간을 70% 이상 단축했습니다.',
        performance: '가상 DOM 메모이제이션을 적용하여 다중 강의 등록 시 렌더링 랙을 완전히 해소하고 교내 베타 테스트 DAU 200+을 달성했습니다.'
      }
    },
    {
      dexNo: '#002',
      title: 'DevSync',
      subtitle: '실시간 마크다운 & 코드 협업 엔진',
      type: 'water',
      typeLabel: 'WATER / TYPE',
      tags: ['TypeScript', 'React', 'WebSocket', 'CodeMirror', 'CRDT'],
      period: '2024.08 — 2024.11',
      accentColor: '#3B82F6',
      summary: '다수의 개발자가 브라우저 상에서 실시간 동시 마크다운 편집과 코드 블록 실행을 동시에 수행할 수 있는 테크니컬 협업 에디터입니다.',
      stats: {
        attack: '98% (CRDT 충돌 해결 엔진)',
        defense: '96% (WebSocket 연결 복구성)',
        speed: '99% (지연시간 50ms 미만)'
      },
      details: {
        background: '원격 협업 시 문서 편집과 코드 검증 도구가 분리되어 발생하는 잦은 화면 전환과 컨텍스트 손실을 해결하고자 제작했습니다.',
        solution: 'CRDT 기반 무충돌 동기화 알고리즘과 브라우저 인-메모리 샌드박스를 결합하여 실시간 공동 편집과 결과 실행을 하나의 뷰에서 지원합니다.',
        performance: '가상 뷰포트 렌더링을 적용하여 대용량 문서 편집 시 메모리 사용량을 45% 절감하고 Lighthouse 98점을 획득했습니다.'
      }
    },
    {
      dexNo: '#003',
      title: 'Green City AI Hub',
      subtitle: '스마트시티 센서 데이터 & 환경 분석 대시보드',
      type: 'grass',
      typeLabel: 'GRASS / TYPE',
      tags: ['Python', 'React', 'FastAPI', 'Chart.js', 'GeoJSON'],
      period: '2024.09 — 2025.01',
      accentColor: '#10B981',
      summary: '상명대 그린스마트시티학과 도메인 지식을 바탕으로 도시 기상 센서, 녹지 비율, 에너지 사용량을 시각화한 지능형 관제 대시보드입니다.',
      stats: {
        attack: '94% (시계열 데이터 모델링)',
        defense: '95% (센서 데이터 무결성)',
        speed: '93% (지도 렌더링 최적화)'
      },
      details: {
        background: '스마트시티 환경 모니터링 과정에서 쏟아지는 방대한 다차원 센서 데이터를 직관적으로 한눈에 파악하고 이상 징후를 조기에 탐지하고자 구축했습니다.',
        solution: 'GeoJSON 기반 구역별 열지도(Heatmap)와 시계열 인터랙티브 차트를 구축하여 복잡한 도시 환경 지표를 3초 안에 파악할 수 있도록 설계했습니다.',
        performance: '데이터 캐싱 파이프라인 구축을 통해 10만 건 이상의 센서 로그 조회 시 초기 렌더링 속도를 65% 개선했습니다.'
      }
    },
    {
      dexNo: '#004',
      title: 'FlowTask',
      subtitle: '스마트 우선순위 분석 칸반 보드',
      type: 'psychic',
      typeLabel: 'PSYCHIC / TYPE',
      tags: ['JavaScript', 'HTML5 DnD', 'Chart.js', 'Local Storage'],
      period: '2024.12 — 2025.03',
      accentColor: '#EC4899',
      summary: '아이젠하워 매트릭스 알고리즘과 인터랙티브 칸반 보드를 융합하여 업무 몰입도를 극대화하는 지능형 태스크 매니저입니다.',
      stats: {
        attack: '92% (우선순위 자동 분류)',
        defense: '94% (로컬 저장소 자동 동기화)',
        speed: '100% (네이티브 60fps 드래그앤드롭)'
      },
      details: {
        background: '단순한 To-Do 목록의 한계를 넘어, 중요도와 긴급도를 기반으로 실시간 우선순위를 재계산해주는 스마트 업무 환경을 구현했습니다.',
        solution: 'HTML5 네이티브 Drag & Drop API와 애니메이션 프레임을 최적화하여 별도의 라이브러리 없이 가볍고 부드러운 드래그 경험을 완성했습니다.',
        performance: '100% 순수 Vanilla JS 경량 구조로 번들 크기 0KB, 완전 오프라인 지원을 달성했습니다.'
      }
    }
  ];

  // ------------------------------------------------------------------------
  // 3. Web Audio API: 8-Bit Retro Synthesizer Engine (Zero External Audio)
  // ------------------------------------------------------------------------
  let soundEnabled = true;
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
  }

  function play8BitTone(freq, type = 'square', duration = 0.08, delay = 0) {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);

      gain.gain.setValueAtTime(0.06, audioCtx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + delay + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(audioCtx.currentTime + delay);
      osc.stop(audioCtx.currentTime + delay + duration);
    } catch (e) {
      // Audio not permitted yet
    }
  }

  // Predefined Pokémon Style Sound FX
  const soundFX = {
    click: () => {
      play8BitTone(520, 'square', 0.04);
    },
    select: () => {
      play8BitTone(440, 'square', 0.05);
      play8BitTone(880, 'square', 0.08, 0.06);
    },
    openDex: () => {
      play8BitTone(330, 'triangle', 0.06);
      play8BitTone(440, 'triangle', 0.06, 0.06);
      play8BitTone(660, 'square', 0.12, 0.12);
    },
    success: () => {
      play8BitTone(523.25, 'triangle', 0.08); // C5
      play8BitTone(659.25, 'triangle', 0.08, 0.08); // E5
      play8BitTone(783.99, 'triangle', 0.08, 0.16); // G5
      play8BitTone(1046.50, 'square', 0.20, 0.24); // C6
    }
  };

  // Sound Toggle Button
  const btnSoundToggle = document.getElementById('btn-sound-toggle');
  const soundIcon = document.getElementById('sound-icon');

  if (btnSoundToggle && soundIcon) {
    btnSoundToggle.addEventListener('click', () => {
      initAudio();
      soundEnabled = !soundEnabled;
      if (soundEnabled) {
        btnSoundToggle.classList.add('active-sound');
        soundIcon.className = 'fa-solid fa-volume-high';
        soundFX.success();
        showToast('🔊 8비트 사운드 효과음이 켜졌습니다!');
      } else {
        btnSoundToggle.classList.remove('active-sound');
        soundIcon.className = 'fa-solid fa-volume-xmark';
        showToast('🔇 효과음이 음소거되었습니다.');
      }
    });
  }

  // ------------------------------------------------------------------------
  // 4. Day / Night Route Theme Engine
  // ------------------------------------------------------------------------
  const btnThemeToggle = document.getElementById('btn-theme-toggle');
  const themeIcon = document.getElementById('theme-icon');

  // Load saved theme
  const savedTheme = localStorage.getItem('poke_theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    if (themeIcon) themeIcon.className = 'fa-solid fa-sun';
  }

  if (btnThemeToggle) {
    btnThemeToggle.addEventListener('click', () => {
      soundFX.click();
      document.body.classList.toggle('dark-theme');
      const isDark = document.body.classList.contains('dark-theme');
      
      if (themeIcon) {
        themeIcon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
      }

      localStorage.setItem('poke_theme', isDark ? 'dark' : 'light');
      showToast(isDark ? '🌙 야간 모드로 전환되었습니다.' : '☀️ 주간 모드로 전환되었습니다.');
    });
  }

  // ------------------------------------------------------------------------
  // 5. 3D Holographic Trainer Card Mouse Tilt Engine
  // ------------------------------------------------------------------------
  const trainerCard = document.getElementById('interactive-trainer-card');
  if (trainerCard) {
    const cardWrapper = trainerCard.parentElement;

    cardWrapper.addEventListener('mousemove', (e) => {
      const rect = cardWrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -12;
      const rotateY = ((x - centerX) / centerX) * 12;

      trainerCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    cardWrapper.addEventListener('mouseleave', () => {
      trainerCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });

    cardWrapper.addEventListener('mouseenter', () => {
      soundFX.click();
    });
  }

  // ------------------------------------------------------------------------
  // 6. Render: 8 Gym Badges
  // ------------------------------------------------------------------------
  const badgesContainer = document.getElementById('badges-container');
  if (badgesContainer) {
    badgesContainer.innerHTML = badgesData.map((badge, idx) => `
      <div class="badge-item-card" style="--badge-color: ${badge.color};" data-badge-id="${badge.id}">
        <span class="badge-rank-tag">BADGE #0${idx + 1}</span>
        <div class="badge-emblem">
          <i class="fa-solid ${badge.icon}"></i>
        </div>
        <h4 class="badge-name">${badge.name}</h4>
        <span class="badge-tech-label">${badge.tech}</span>
        <p class="badge-desc">${badge.desc}</p>
      </div>
    `).join('');

    // Badge click sound
    badgesContainer.querySelectorAll('.badge-item-card').forEach(card => {
      card.addEventListener('mouseenter', () => soundFX.click());
      card.addEventListener('click', () => {
        soundFX.select();
        const badgeName = card.querySelector('.badge-name').textContent;
        showToast(`🎖️ [${badgeName}] 스킬 배지를 확인했습니다!`);
      });
    });
  }

  // ------------------------------------------------------------------------
  // 7. Render: Code-Dex Archive & Filtering Engine
  // ------------------------------------------------------------------------
  const dexContainer = document.getElementById('dex-container');
  const dexFilterBtns = document.querySelectorAll('.dex-filter-btn');

  function renderDexCards(filterType = 'all') {
    if (!dexContainer) return;

    const filtered = filterType === 'all' 
      ? dexProjectsData 
      : dexProjectsData.filter(p => p.type === filterType);

    if (filtered.length === 0) {
      dexContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);">
          <i class="fa-solid fa-circle-question" style="font-size: 2.5rem; margin-bottom: 1rem; color: var(--poke-yellow);"></i>
          <p style="font-weight: 700;">해당 타입의 등록된 도감 데이터가 없습니다.</p>
        </div>
      `;
      return;
    }

    dexContainer.innerHTML = filtered.map(item => `
      <div class="dex-card" data-dex-no="${item.dexNo}" style="--card-accent: ${item.accentColor};">
        <div class="dex-card-header">
          <span class="dex-number">${item.dexNo}</span>
          <div class="type-pills-wrap">
            <span class="type-pill ${item.type}">
              <i class="fa-solid fa-tag"></i> ${item.typeLabel}
            </span>
          </div>
        </div>

        <div class="dex-card-body">
          <h3 class="dex-project-title">${item.title}</h3>
          <p class="dex-project-subtitle">${item.subtitle}</p>
          <p class="dex-project-summary">${item.summary}</p>

          <div class="dex-tags-list">
            ${item.tags.map(t => `<span class="dex-tech-tag">${t}</span>`).join('')}
          </div>

          <div class="dex-card-footer">
            <span class="dex-period">${item.period}</span>
            <span class="dex-view-btn">
              <span>도감 데이터 열기</span>
              <i class="fa-solid fa-arrow-right"></i>
            </span>
          </div>
        </div>
      </div>
    `).join('');

    // Attach click events for modal
    dexContainer.querySelectorAll('.dex-card').forEach(card => {
      card.addEventListener('mouseenter', () => soundFX.click());
      card.addEventListener('click', () => {
        const dexNo = card.getAttribute('data-dex-no');
        const project = dexProjectsData.find(p => p.dexNo === dexNo);
        if (project) {
          openPokedexModal(project);
        }
      });
    });
  }

  // Initial Render
  renderDexCards('all');

  // Filter Buttons
  dexFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      soundFX.select();
      dexFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      renderDexCards(filter);
    });
  });

  // ------------------------------------------------------------------------
  // 8. Pokedex Detail Screen Modal
  // ------------------------------------------------------------------------
  const pokedexModal = document.getElementById('pokedex-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalProjectTitle = document.getElementById('modal-project-title');
  const modalBodyContainer = document.getElementById('modal-body-container');

  function openPokedexModal(project) {
    soundFX.openDex();
    if (modalProjectTitle) {
      modalProjectTitle.textContent = `${project.dexNo} ${project.title}`;
    }

    if (modalBodyContainer) {
      modalBodyContainer.innerHTML = `
        <div style="margin-bottom: 1.5rem;">
          <span class="type-pill ${project.type}" style="font-size: 0.82rem; padding: 0.35rem 0.8rem;">
            ${project.typeLabel}
          </span>
          <h2 style="font-size: 1.8rem; font-weight: 900; margin: 0.6rem 0 0.2rem; color: var(--text-main);">
            ${project.title}
          </h2>
          <p style="font-size: 1rem; font-weight: 700; color: ${project.accentColor};">
            ${project.subtitle}
          </p>
        </div>

        <div class="modal-meta-grid">
          <div>
            <span class="modal-meta-item-label">DEVELOPMENT PERIOD</span>
            <div class="modal-meta-item-value">${project.period}</div>
          </div>
          <div>
            <span class="modal-meta-item-label">CORE TECH STACK</span>
            <div class="modal-meta-item-value">${project.tags.join(', ')}</div>
          </div>
        </div>

        <div style="margin-bottom: 1.5rem; background: var(--bg-secondary); padding: 1.25rem; border-radius: var(--radius-md); border-left: 4px solid var(--poke-red);">
          <div class="modal-section-heading">
            <i class="fa-solid fa-chart-simple" style="color: var(--poke-red);"></i>
            <span>도감 스탯 지표 (STAT MATRIX)</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.5rem; font-size: 0.9rem; font-weight: 700;">
            <div>⚔️ 공격력 (코드 설계 & 모듈성): <span style="color: var(--poke-red);">${project.stats.attack}</span></div>
            <div>🛡️ 방어력 (안정성 & 무결성): <span style="color: var(--poke-blue);">${project.stats.defense}</span></div>
            <div>⚡ 스피드 (성능 & 응답 속도): <span style="color: #D97706;">${project.stats.speed}</span></div>
          </div>
        </div>

        <div>
          <div class="modal-section-heading">
            <i class="fa-solid fa-bullseye" style="color: var(--poke-blue);"></i>
            <span>프로젝트 기획 배경</span>
          </div>
          <p class="modal-narrative-text">${project.details.background}</p>

          <div class="modal-section-heading">
            <i class="fa-solid fa-wand-magic-sparkles" style="color: var(--poke-yellow);"></i>
            <span>핵심 문제 해결 및 구현</span>
          </div>
          <p class="modal-narrative-text">${project.details.solution}</p>

          <div class="modal-section-heading">
            <i class="fa-solid fa-trophy" style="color: #22C55E;"></i>
            <span>최적화 성과 및 결과</span>
          </div>
          <p class="modal-narrative-text">${project.details.performance}</p>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
          <button class="btn-poke-primary" id="btn-modal-inner-close">
            <span>확인 완료</span>
          </button>
        </div>
      `;

      const innerClose = document.getElementById('btn-modal-inner-close');
      if (innerClose) {
        innerClose.addEventListener('click', closePokedexModal);
      }
    }

    if (pokedexModal) {
      pokedexModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closePokedexModal() {
    soundFX.click();
    if (pokedexModal) {
      pokedexModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closePokedexModal);
  }

  if (pokedexModal) {
    pokedexModal.addEventListener('click', (e) => {
      if (e.target === pokedexModal) {
        closePokedexModal();
      }
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && pokedexModal && pokedexModal.classList.contains('active')) {
      closePokedexModal();
    }
  });

  // ------------------------------------------------------------------------
  // 9. Instant Copy & Poke-Comms Form
  // ------------------------------------------------------------------------
  function copyToClipboard(text, successMsg) {
    navigator.clipboard.writeText(text).then(() => {
      soundFX.success();
      showToast(successMsg);
    }).catch(() => {
      // Fallback
      showToast(`📋 ${text}`);
    });
  }

  const heroCopyPhoneBtn = document.getElementById('btn-hero-copy-phone');
  if (heroCopyPhoneBtn) {
    heroCopyPhoneBtn.addEventListener('click', () => {
      const phone = heroCopyPhoneBtn.getAttribute('data-phone') || '010-4677-2417';
      copyToClipboard(phone, `⚡ 트레이너 연락처(${phone})가 복사되었습니다!`);
    });
  }

  const commsPhoneBtn = document.getElementById('comms-phone-btn');
  if (commsPhoneBtn) {
    commsPhoneBtn.addEventListener('click', () => {
      const phone = commsPhoneBtn.getAttribute('data-phone') || '010-4677-2417';
      copyToClipboard(phone, `⚡ 전화번호(${phone})가 클립보드에 복사되었습니다!`);
    });
  }

  const commsEmailBtn = document.getElementById('comms-email-btn');
  if (commsEmailBtn) {
    commsEmailBtn.addEventListener('click', () => {
      const email = commsEmailBtn.getAttribute('data-email') || 'dvae1456@gmail.com';
      copyToClipboard(email, `✉️ 이메일 주소(${email})가 클립보드에 복사되었습니다!`);
    });
  }

  // Poké-PC Contact Form Transmit
  const pokeContactForm = document.getElementById('poke-contact-form');
  if (pokeContactForm) {
    pokeContactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      soundFX.success();

      const name = document.getElementById('input-trainer-name')?.value || '트레이너';
      showToast(`📡 [${name}] 님의 통신 메시지가 트레이너 본부로 성공적으로 전송되었습니다!`);
      pokeContactForm.reset();
    });
  }

  // ------------------------------------------------------------------------
  // 10. Toast Notification Engine
  // ------------------------------------------------------------------------
  const toastContainer = document.getElementById('toast-container');

  function showToast(message) {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'poke-toast';
    toast.innerHTML = `
      <div class="pokeball-icon" style="width: 20px; height: 20px;"></div>
      <span>${message}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // ------------------------------------------------------------------------
  // 11. Smooth Navigation Links Audio
  // ------------------------------------------------------------------------
  document.querySelectorAll('.nav-link, .brand-trainer').forEach(link => {
    link.addEventListener('click', () => {
      soundFX.click();
    });
  });

});
