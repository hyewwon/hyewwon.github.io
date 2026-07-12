const INSIGHTS = [
  {
    title: "Long-running AI jobs",
    text: "이미지 생성, 음성 생성, 예측 자동화처럼 오래 걸리는 작업은 사용자 요청 흐름과 분리해야 합니다.",
    tag: "Async"
  },
  {
    title: "External API uncertainty",
    text: "OpenAI, Fal.ai, Replicate 같은 외부 API는 지연과 실패 가능성을 전제로 연결해야 합니다.",
    tag: "AI API"
  },
  {
    title: "Auth shapes boundaries",
    text: "권한과 인증 흐름은 API 구조, 데이터 접근 범위, 운영 도구의 경계를 결정합니다.",
    tag: "Auth"
  },
  {
    title: "Data integrity matters",
    text: "결제, 리워드, 정산 흐름에서는 기능보다 먼저 데이터 정합성과 추적 가능성이 중요합니다.",
    tag: "Data"
  },
  {
    title: "Scheduled work needs visibility",
    text: "주기성 작업과 배치성 처리는 상태, 실패, 재시도 기준을 운영자가 확인할 수 있어야 합니다.",
    tag: "Ops"
  },
  {
    title: "Admin reduces operation cost",
    text: "관리 도구와 자동화 기능은 반복 운영 비용을 줄이고 서비스 대응 속도를 높입니다.",
    tag: "Admin"
  }
];

const STRATEGIES = [
  {
    label: "Connect",
    title: "제품 API와 외부 서비스를 느슨하게 연결합니다.",
    body: "AI 모델 API, 내부 서비스 API, 인증 흐름을 제품 요구사항에 맞춰 연결하고, 외부 의존성이 제품 전체를 흔들지 않도록 경계를 만듭니다.",
    stack: ["DRF", "OpenAI", "Fal.ai", "Replicate", "ComfyUI"],
    metric: "API / Integration"
  },
  {
    label: "Queue",
    title: "기다려야 하는 작업은 비동기 흐름으로 옮깁니다.",
    body: "사용자 요청은 빠르게 받고, 긴 처리는 Celery와 Redis 기반 작업 흐름으로 넘깁니다. 상태 확인과 재처리 가능성을 함께 고려합니다.",
    stack: ["Celery", "Redis", "Scheduler", "Worker", "Status"],
    metric: "Async / Worker"
  },
  {
    label: "Operate",
    title: "운영자가 확인하고 다룰 수 있는 구조로 마무리합니다.",
    body: "Django Admin, 배포 환경, 데이터 관리, 로그와 상태 확인 흐름까지 고려해 기능이 실제 서비스 안에서 유지되도록 만듭니다.",
    stack: ["Django Admin", "Docker", "AWS", "Linux", "PostgreSQL"],
    metric: "Admin / Ops"
  }
];

const PROJECTS = [
  {
    title: "[Samsung] Image Generation AI Tool",
    category: "AI Backend",
    period: "Plus X / 2024 - Present",
    problem: "AI 이미지 생성 작업을 인증 기반 서비스 흐름 안에서 안정적으로 처리해야 했습니다.",
    role: "AI 이미지 생성 파이프라인과 백엔드 API 개발",
    flow: "Request -> Auth -> Generation API -> Async processing -> Result management",
    stack: ["Python", "Django", "DRF", "Celery", "Redis", "AI API"]
  },
  {
    title: "T Universe Figma Plugin",
    category: "AI Plugin Backend",
    period: "Plus X / 2024 - Present",
    problem: "플러그인에서 발생하는 이미지 생성 요청을 비동기 백엔드 흐름으로 연결해야 했습니다.",
    role: "플러그인 백엔드 API와 비동기 처리 구조 개발",
    flow: "Plugin request -> Backend API -> Queue -> Worker -> Generated asset",
    stack: ["Django", "DRF", "Celery", "Redis", "Fal.ai"]
  },
  {
    title: "Another Class",
    category: "AI Voice Backend",
    period: "Plus X / 2024 - Present",
    problem: "AI 음성 생성 결과를 서비스 흐름에 맞춰 실시간 처리와 연동해야 했습니다.",
    role: "AI 음성 생성 서비스 백엔드 개발 및 처리 흐름 연동",
    flow: "Voice request -> External model -> Status tracking -> Service response",
    stack: ["Python", "Django", "AI API", "Redis"]
  },
  {
    title: "Pagee Reward Payment",
    category: "Payment API",
    period: "GNC Solution / 2022 - 2024",
    problem: "광고 리워드 기반 포인트 결제 흐름에서 데이터 정합성과 서버 운영이 중요했습니다.",
    role: "리워드 결제 서비스 설계, 개발, 서버 운영",
    flow: "Reward event -> Point balance -> Payment API -> Settlement data",
    stack: ["Python", "Django", "MariaDB", "Linux"]
  },
  {
    title: "BuildPay",
    category: "Payment / Settlement",
    period: "GNC Solution / 2022 - 2024",
    problem: "전자지갑과 빌드몰을 연결하는 결제/정산 API가 필요했습니다.",
    role: "전자지갑 및 빌드몰 연동 API 개발",
    flow: "Wallet -> Build mall -> Payment -> Settlement",
    stack: ["Django", "REST API", "MariaDB", "Auth"]
  },
  {
    title: "EMAX",
    category: "Prediction Automation",
    period: "GNC Solution / 2022 - 2024",
    problem: "전력 소모 예측 AI 서비스에서 데이터 관리와 예측 자동화 흐름이 필요했습니다.",
    role: "데이터 관리 및 예측 자동화 백엔드 설계",
    flow: "Energy data -> Processing -> Prediction -> Managed result",
    stack: ["Python", "Django", "MariaDB", "Scheduler"]
  }
];
