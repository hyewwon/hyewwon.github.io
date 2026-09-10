(() => {
  const root = document.querySelector('[data-projects-window]');
  if (!root) return;
  // Content: feature/frog-motion:index.html and feature/1:_includes/about_modal.html.
  // Dates are included only where the source specifies a consistent project period.
  const projects = [
    { id: 'emax', name: 'EMAX', icon: 'E', theme: 'energy', category: 'ai', company: 'GNC Solution', role: '웹 풀스택 개발', tags: ['Python', 'Django', 'Pandas', 'MariaDB', 'JavaScript', 'APScheduler'], summary: '전력 소모 예측 AI와 데이터 관리 플랫폼', image: 'assets/image/work_project/emax.png', description: '전자 장비의 전력 소모 데이터를 관리하고 LSTM·Prophet 모델의 시간별·일별·월별 예측 결과를 확인하는 서비스입니다.', contributions: ['Django와 JavaScript를 사용한 웹 개발 및 DB 테이블 설계', '모델 학습·추론, 모델 파일 저장, 예측 데이터 처리 로직 모듈화', 'AI 파트와 협업하여 예측 모듈을 서비스에 연동'], problem: '기존 DB Event Scheduler는 복잡한 프로시저에 의존해 유지보수가 어렵고 사용자가 작업 일정을 직접 관리하기 어려웠습니다.', solution: 'Django-apscheduler 기반의 커스텀 스케줄러를 구축하고, 관리 화면에서 작업과 실행 시간을 설정할 수 있도록 구현했습니다.', result: '스케줄러와 작업 로직을 Django에서 통합 관리하고, 사용자 화면에서 작업 일정을 동적으로 변경할 수 있게 했습니다.' },
    { id: 'buildpay', name: 'BuildPay', icon: 'B', theme: 'payment', category: 'platform', company: 'GNC Solution · 빌드텍', role: '앱 백엔드 · 관리자 웹', period: '2022.08–2023.02 / 2023.05–08 고도화', tags: ['Django', 'GraphQL', 'REST API', 'MariaDB', 'Pandas'], summary: '전자지갑과 쇼핑몰을 연결하는 결제 서비스', image: 'assets/image/work_project/buildpay.png', description: '여러 종류의 가상화폐를 관리하는 전자지갑 앱입니다. 일부 코인을 포인트로 전환해 전용 쇼핑몰 Build Mall에서 사용할 수 있습니다.', contributions: ['GraphQL 기반 앱 API 및 관리자 웹 개발', 'Build Mall 연동을 위한 REST API와 데이터 구조 구현', 'Gunicorn·Nginx 기반 서버 관리 및 배포'], problem: '여러 프로젝트에서 데이터 목록을 엑셀로 저장하는 기능이 필요했지만 구현 방식이 제각각이었습니다.', solution: 'Pandas와 ExcelWriter를 활용해 엑셀 내보내기 기능을 모듈화했습니다.', result: '여러 프로젝트에서 같은 방식으로 엑셀 저장 기능을 재사용하고 확장할 수 있게 했습니다.' },
    { id: 'performance', name: 'Build Performance', icon: 'BP', theme: 'automation', category: 'platform', company: 'GNC Solution · 빌드텍', role: '앱 백엔드 · 관리자 웹', period: '2023.08–2023.10', tags: ['Django', 'GraphQL', 'Celery', 'MariaDB'], summary: '대규모 주기성 작업과 보상 처리 자동화', image: 'assets/image/work_project/build_performance.png', description: 'BuildPay와 연동하는 채굴기 관리 앱으로, 등급별 주기성 작업과 보상 분배를 처리합니다.', contributions: ['GraphQL 앱 API 및 관리자 웹 개발', '등급별 채굴·추천인 보상·분배량 계산 태스크 구현', '웹 서버 관리 및 배포'], problem: '10분마다 많은 사용자의 데이터를 처리해야 했고, 기존 DB 프로시저 기반 스케줄링은 관리와 확장이 어려웠습니다.', solution: 'Celery와 Celery Beat로 스케줄링을 전환하고 SQL에 있던 작업 로직을 Python 태스크로 옮겼습니다.', result: '비동기 큐 기반으로 작업을 분산하고 실행 내역과 오류 로그를 기록할 수 있게 했습니다.' },
    { id: 'envisager', name: 'Envisager', icon: 'en', theme: 'art', category: 'platform', company: 'GNC Solution', role: '웹 풀스택 · 앱 API', period: '2023.06–2023.11', tags: ['Django', 'DRF', 'SimpleJWT', 'MariaDB'], summary: '작품 등록과 거래를 연결하는 예술 플랫폼', image: 'assets/image/work_project/envisager.png', description: '작가의 디지털 작품 등록·판매와 사용자의 작품 구매를 연결하는 예술 플랫폼입니다.', contributions: ['웹 페이지 및 DRF 기반 앱 API 개발', 'MariaDB 데이터 구조 구현', 'Gunicorn·Nginx 기반 웹 서버 관리 및 배포'], problem: '세션 기반 인증을 앱 환경으로 확장하면서 인증 흐름을 정리할 필요가 있었습니다.', solution: 'DRF SimpleJWT를 사용해 토큰 기반 인증 구조를 적용했습니다.', result: '앱과 웹의 인증 로직을 통합하고 일관된 방식으로 관리할 수 있도록 정리했습니다.' },
    { id: 'enjo', name: 'Enjo-Eat', icon: 'ee', theme: 'food', category: 'personal', company: '개인 프로젝트', role: '기획 · 디자인 · 개발', period: '2022.09.20–2022.10.16', tags: ['Django', 'JavaScript', 'Selenium', 'MariaDB', 'Kakao Map API'], summary: '음식점과 메뉴를 쉽고 즐겁게 고르는 서비스', image: 'assets/image/enjo_eat/main2.png', github: 'https://github.com/hyewwon/Enjo_eat', description: '점심 메뉴를 정하기 어려웠던 경험에서 시작했습니다. 지역이나 목적별로 음식점을 모으고, 다른 사용자와 공유하며 선택할 수 있습니다.', contributions: ['Django와 JavaScript 기반의 서비스 기획·개발', 'Kakao Map API로 음식점 위치·이름 입력 지원', 'Selenium 기반 이미지 검색·등록 기능 구현'], problem: '식당과 메뉴를 고르는 고민을 줄이고, 음식점을 등록하는 과정도 편리하게 만들고 싶었습니다.', solution: '음식점 그룹과 선택 기능을 만들고 지도 입력과 이미지 검색 기능을 연결했습니다.', result: '기획한 아이디어를 하나의 서비스로 구현하며 Django와 JavaScript의 실무 활용 경험을 쌓았습니다.' },
    { id: 'samsung-ai', name: '이미지 생성 AI 툴', icon: 'AI', theme: 'intelligence', category: 'ai', company: '플러스엑스 · 삼성전자', role: '백엔드 개발', tags: [], summary: 'AI 이미지 생성 파이프라인과 인증 API', description: 'AI 이미지 생성 툴의 서버 기능을 개발했습니다.', contributions: ['AI 이미지 생성 파이프라인 개발', '인증 기반 백엔드 API 개발'] },
    { id: 'genai', name: 'GenAI', icon: 'G', theme: 'intelligence', category: 'ai', company: '플러스엑스', role: '백엔드 설계 · 운영', tags: [], summary: 'AI 이미지 생성 서비스의 백엔드 구조', description: 'AI 이미지 생성 서비스의 백엔드 구조 설계와 운영을 담당했습니다.', contributions: ['AI 이미지 생성 서비스 백엔드 구조 설계', '서비스 백엔드 운영'] },
    { id: 'tuniverse', name: 'T Universe Figma Plugin', icon: 'T', theme: 'art', category: 'ai', company: '플러스엑스', role: '백엔드 개발', tags: [], summary: '플러그인에서 이어지는 AI 이미지 생성', description: 'AI 이미지 생성 플러그인의 백엔드와 비동기 처리 구조를 개발했습니다.', contributions: ['플러그인 백엔드 개발', 'AI 생성 작업을 위한 비동기 처리 구조 구현'] },
    { id: 'another', name: 'Another Class', icon: 'a', theme: 'automation', category: 'ai', company: '플러스엑스', role: '백엔드 개발', tags: [], summary: 'AI 음성 생성과 실시간 처리 연동', description: 'AI 음성 생성 서비스의 백엔드를 개발하고 실시간 처리를 연동했습니다.', contributions: ['AI 음성 생성 서비스 백엔드 개발', '실시간 처리 연동'] },
    { id: 'groupware', name: 'Groupware', icon: 'gw', theme: 'payment', category: 'platform', company: '플러스엑스', role: '백엔드 개발 · 운영', tags: [], summary: '사내 업무를 연결하는 알림과 자동화', description: '사내 서비스의 백엔드를 개발하고 알림·자동화 기능을 운영했습니다.', contributions: ['사내 서비스 백엔드 개발', '알림·자동화 기능 운영'] },
    { id: 'pagee', name: 'Pagee', icon: 'P', theme: 'food', category: 'platform', company: 'GNC Solution · Pagee', role: '백엔드 설계 · 개발', tags: [], summary: '광고 리워드 기반 포인트 결제 서비스', description: '광고 리워드 기반 포인트 결제 서비스의 설계·개발과 서버 운영을 담당했습니다.', contributions: ['포인트 결제 서비스 설계·개발', '서버 운영'] },
    { id: 'deeponde', name: 'Deeponde', icon: 'D', theme: 'energy', category: 'platform', company: '플러스엑스 · Deeponde', role: '백엔드 설계 · 운영', tags: [], summary: '이벤트 서비스를 위한 백엔드 아키텍처', description: '이벤트 서비스의 백엔드 아키텍처를 설계하고 운영했습니다.', contributions: ['이벤트 서비스 백엔드 아키텍처 설계', '서비스 운영'] },
  ];
  const content = root.querySelector('[data-store-content]');
  const discovery = root.querySelector('[data-store-discovery]');
  const detail = root.querySelector('[data-store-detail]');
  const search = root.querySelector('[data-store-search]');
  const list = root.querySelector('[data-store-list]');
  const categories = { all: '새로운 발견', ai: 'AI 서비스', platform: '플랫폼 · 결제', personal: '개인 프로젝트' };
  let category = 'all';
  let savedScroll = 0;
  let activeProject = null;
  const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const icon = project => `<span class="store-app-icon store-app-icon--${project.theme}" aria-hidden="true">${project.icon}</span>`;
  function renderList() {
    const term = search.value.trim().toLocaleLowerCase();
    const matches = projects.filter(p => (category === 'all' || p.category === category) && `${p.name} ${p.company} ${p.summary} ${p.tags.join(' ')}`.toLocaleLowerCase().includes(term));
    discovery.hidden = false;
    detail.hidden = true;
    activeProject = null;
    root.querySelector('[data-store-heading]').textContent = term ? '검색 결과' : categories[category];
    root.querySelector('[data-store-count]').textContent = `${matches.length}개의 프로젝트`;
    root.querySelector('[data-store-editorial]').hidden = Boolean(term) || category !== 'all';
    root.querySelector('[data-store-list-title]').textContent = category === 'all' ? '모든 프로젝트' : categories[category];
    list.innerHTML = matches.map(p => `<button class="store-app-row" type="button" data-project-id="${p.id}">${icon(p)}<span class="store-app-row__text"><strong>${escape(p.name)}</strong><span>${escape(p.summary)}</span><small>${escape(p.company)}</small></span><span class="store-get">보기</span></button>`).join('');
    root.querySelector('[data-store-empty]').hidden = matches.length !== 0;
    root.querySelectorAll('[data-store-category]').forEach(button => {
      const selected = button.dataset.storeCategory === category;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  }
  function openProject(id) {
    const p = projects.find(p => p.id === id);
    if (!p) return;
    savedScroll = content.scrollTop;
    activeProject = id;
    discovery.hidden = true;
    detail.hidden = false;
    detail.innerHTML = `<button type="button" class="store-back" data-store-action="back">〈 프로젝트</button>
      <header class="store-detail__heading">${icon(p)}<div><h2 tabindex="-1">${escape(p.name)}</h2><p>${escape(p.summary)}</p>${p.github ? `<a class="store-external" href="${p.github}" target="_blank" rel="noopener noreferrer">GitHub 보기 ↗</a>` : ''}</div></header>
      <dl class="store-facts"><div><dt>소속 · 프로젝트</dt><dd>${escape(p.company)}</dd></div><div><dt>담당 역할</dt><dd>${escape(p.role)}</dd></div>${p.period ? `<div><dt>개발 기간</dt><dd>${escape(p.period)}</dd></div>` : ''}</dl>
      ${p.image ? `<figure class="store-screenshot"><img src="${p.image}" alt="${escape(p.name)} 서비스 화면"><figcaption>${escape(p.name)} · 서비스 화면</figcaption></figure>` : ''}
      <section class="store-detail__section"><h3>프로젝트 소개</h3><p>${escape(p.description)}</p></section>
      <section class="store-detail__section"><h3>내가 맡은 일</h3><ul>${p.contributions.map(item => `<li>${escape(item)}</li>`).join('')}</ul></section>
      ${p.problem ? `<section class="store-case"><h3>개발 이야기</h3><div><h4>해결할 문제</h4><p>${escape(p.problem)}</p></div><div><h4>설계와 구현</h4><p>${escape(p.solution)}</p></div><div><h4>적용 결과</h4><p>${escape(p.result)}</p></div></section>` : ''}
      ${p.tags.length ? `<section class="store-detail__section"><h3>사용 기술</h3><p class="store-tags">${p.tags.map(escape).join(' · ')}</p></section>` : ''}`;
    content.scrollTop = 0;
    detail.querySelector('h2').focus({ preventScroll: true });
  }
  function back() {
    const id = activeProject;
    renderList();
    content.scrollTop = savedScroll;
    discovery.querySelector(`[data-project-id="${id}"]`)?.focus({ preventScroll: true });
  }
  root.addEventListener('click', event => {
    const project = event.target.closest('[data-project-id]');
    if (project) openProject(project.dataset.projectId);
    const filter = event.target.closest('[data-store-category]');
    if (filter) { category = filter.dataset.storeCategory; renderList(); content.scrollTop = 0; }
    const action = event.target.closest('[data-store-action]');
    if (action?.dataset.storeAction === 'back') back();
    if (action?.dataset.storeAction === 'close') { root.classList.add('is-closed'); document.querySelector('[data-projects-open]').focus(); }
    if (action?.dataset.storeAction === 'expand') action.setAttribute('aria-pressed', String(root.classList.toggle('is-expanded')));
  });
  search.addEventListener('input', () => { renderList(); content.scrollTop = 0; });
  root.addEventListener('keydown', event => { if (event.key === 'Escape' && activeProject) back(); });
  document.querySelector('[data-projects-open]').addEventListener('click', () => { root.classList.remove('is-closed'); search.focus(); });
  renderList();
})();
