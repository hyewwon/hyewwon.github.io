(() => {
  const root = document.querySelector('[data-projects-window]');
  if (!root) return;
  // Company project names, summaries, and order match assets/documents/experience.html.
  // Existing case studies and personal projects retain their branch-sourced details.
  // Dates are included only where the source specifies a consistent project period.
  const projects = [
    // Evidence: works' 2026 review and weekly log; closed-network deployment is user-confirmed.
    // Omit internal schema names, security thresholds, and review feedback from public copy.
    {
      id: 'kb', name: 'KB 자산운용 웹사이트 통합 개편', icon: 'KB', brand: 'kb', category: 'plusx', company: 'PlusX · KB 자산운용',
      role: '백엔드 설계·개발 · 인증·개인정보 · CMS · 배포', period: '2026.01–2026.08',
      tags: ['Python', 'Django', 'django-allauth', 'Django Unfold', 'JWT', 'AES-256-GCM', 'HMAC', 'Swagger', 'S3'],
      summary: 'KB 자산운용·RISE ETF 통합 웹사이트의 회원 인증·CMS·금융상품 API 개발 및 폐쇄망 인프라 배포',
      description: 'KB 자산운용과 RISE ETF 웹사이트를 공통 백엔드·CMS로 통합하는 프로젝트입니다. 기존 데이터와 운영 기능을 분석하고, 회원 인증·개인정보 처리·외부 본인인증 연동을 설계했습니다. 콘텐츠·금융상품·마이페이지 API와 관리자 기능을 개발하고, QA와 폐쇄망 배포 작업에도 참여했습니다.',
      contributions: [
        '데이터·공통 API 기반: 기존 두 사이트의 테이블과 CMS 기능을 분석해 ERD와 데이터 모델을 정리했습니다. 이전 대상·유지 기능을 검토하고 공통 예외 응답, 페이지네이션, Swagger 스키마 헬퍼와 API 문서 작성 방식을 구성했습니다.',
        '회원·외부 인증: 회원가입·로그인·로그아웃·탈퇴와 JWT 발급·갱신·검증을 구현했습니다. 소셜 로그인·계정 연동·해제, 휴대폰 본인인증의 요청·콜백 처리를 개발하고 아이디 찾기·비밀번호 초기화·동의 이력까지 연결했습니다.',
        '개인정보·권한: 개인정보 필드에 AES-256-GCM 암호화와 HMAC 기반 검색용 해시를 적용했습니다. 회원 탈퇴·재가입 정책, 로그인 요청 제한과 관리자 권한을 반영하고, 본인인증 연동에 필요한 암복호화 클라이언트 모듈을 개발했습니다.',
        'CMS·콘텐츠: 공지·공시·뉴스·영상·인사이트·연금·투자 가이드의 모델, 공개 API와 관리 화면을 구현했습니다. 메뉴별 운영 권한, 배너·푸터·이벤트 관리와 콘텐츠 AI 생성 API 연동을 추가했습니다.',
        '금융상품: 투자 참고 지표·상품 관련 문서·판매사와 판매 상품 API를 개발했습니다. ETF 계산·비교, 재투자 수익률 차트, 투자성향 적합도 요약과 관련 관리자 기능을 구현했습니다.',
        '마이페이지·추천: 관심 상품·콘텐츠 북마크, 최근 본 콘텐츠·읽기 진행률·활동 포인트와 계산·비교 저장 API를 개발했습니다. 비회원 식별자 처리, 사용자 추천, 상품 랭킹·테마·인기 검색어 조회 기능도 추가했습니다.',
        '고객 응대·로그: 고객 문의의 CAPTCHA 검증·개인정보 암호화·답변·메일 발송을 연결했습니다. 로그인·동의 변경·콘텐츠 조회·메일 발송 이력과 관리자 통계, 외부 콘텐츠 적재·재실행 기능을 구현했습니다.',
        '파일·운영 개선: 대용량 첨부파일을 S3에 직접 선업로드하고 임시파일을 관리하도록 개선했습니다. 소셜 신규가입 직후의 DB 복제 지연 문제와 이메일 재발송 등 운영 이슈에 대응했습니다.',
        '검증·배포: 인증 흐름 검증용 데모와 API 가이드를 작성하고 QA 피드백을 반영했습니다. 프록시 서버 설정·배포, 개인정보 관련 DB 권한 분리와 폐쇄망 배포 작업에 참여했습니다.'
      ],
      problem: '두 사이트의 운영 기능을 통합하면서 회원·소셜 계정·본인인증의 상태 변화를 일관되게 처리해야 했습니다. 개인정보를 암호화해 보호하면서도 운영자가 필요한 회원을 조회할 수 있어야 했고, CMS 권한 역시 운영 영역별로 구분해야 했습니다.',
      solution: '회원 상태와 외부 인증 흐름을 데이터 모델·API에 반영하고, 개인정보 저장용 암호화와 검색용 해시를 분리했습니다. CMS 메뉴별 권한을 적용하고 공통 응답·문서화 기반을 정리해 여러 콘텐츠·상품 기능에서 일관된 방식으로 활용하도록 구성했습니다.',
      result: '회원 인증·개인정보 처리부터 콘텐츠·금융상품 API와 운영자 CMS까지 통합 서비스에 필요한 기능을 구현했습니다. 실제 사용 시나리오의 QA와 배포에 참여하며, 기능 개발뿐 아니라 데이터 보호·운영 권한·배포 환경을 함께 고려하는 경험을 쌓았습니다.'
    },
    // Evidence: works' PlusX 2025 reviews and weekly project log (페이퍼빈).
    // Keep review scores, colleagues' feedback, and internal URLs out of public content.
    {
      id: 'samsung-ai', name: 'Samsung GENI', icon: 'S', brand: 'samsung', category: 'plusx', company: 'PlusX · 삼성전자',
      role: '백엔드 API · 인증·권한 · CMS 개발 · 배포 지원',
      period: '2025 상반기 참여 · 2·3차 2025.08–2026.01',
      tags: ['Python', 'Django', 'Celery', 'JavaScript', 'Nginx', 'ComfyUI', 'Ollama'],
      summary: '삼성 디자인 R&D 센터 내부 AI 이미지 생성 서비스·CMS 개발 및 온프레미스 환경 배포',
      description: '삼성 디자인 R&D 센터에서 사용하는 AI 이미지·텍스트 생성 서비스입니다. PlusX의 삼성 컨설팅 프로젝트로 참여해, 사용자가 이미지를 생성하고 이력을 관리하는 API와 관리자가 사용자·팀·콘텐츠를 운영하는 CMS를 개발했습니다. 초기 인증·CMS 구축부터 2·3차 운영 기능 고도화와 배포 지원까지 담당했습니다.',
      contributions: [
        '인증·권한: 사용자·팀 테이블을 설계하고 로그인·로그아웃, 커스텀 토큰 발급·갱신·검증, 비밀번호 변경·초기화 API를 구현했습니다. 스태프·슈퍼유저 등 역할에 따라 API 접근 권한과 CMS 화면을 구분했습니다.',
        '이미지·생성 이력: 이미지 인스턴스 생성, 목록·상세 조회, 삭제, ZIP 다운로드 API를 개발했습니다. 재생성을 위한 복제·설정 갱신 로직과 커스텀 커서 페이지네이션도 적용했습니다.',
        '비동기 처리: 텍스트 생성·이미지 설명 작업의 Task와 캐시 갱신 로직을 추가하고, Celery 기반 이미지·Style Reference 삭제 스케줄러를 구성했습니다.',
        '관리자 CMS: 유저 일괄 생성, 팀·권한 관리, 예제 프롬프트·Preset·공지사항 API와 관리 화면을 개발했습니다. Fetch 기반 데이터 조회·폼 전송·응답 처리를 연결하고, 3차에서는 팀 일괄 이동과 유저 검색을 추가했습니다.',
        '운영 로그·통계: 이미지 생성·로그인 로그를 모델링하고, 팀·유저별 생성 이미지 수와 서비스 이용 내역을 조회하는 API 및 CSV·Excel 다운로드 기능을 개발했습니다.',
        '오류 대응·QA: 브라우저·Windows·Excel 간 CSV 한글 인코딩 차이에 대응했습니다. 비정상 종료된 생성 작업의 캐시·이미지를 정리하는 API와 CMS 오류 초기화 기능을 구현하고 QA 피드백을 반영했습니다.',
        '환경 구성·배포 지원: Nginx 설정, ComfyUI·Ollama 서버 배포와 배포 후 QA에 참여했습니다. ComfyUI 로컬 이미지 생성 및 Replicate의 ComfyUI API 연동도 테스트했습니다.'
      ],
      problem: '이미지 생성 기능뿐 아니라 사용자·팀별 권한, 콘텐츠 관리, 사용 내역 확인까지 운영자가 처리할 수 있어야 했습니다. 2·3차에서는 생성 로그 기반 통계와 함께 비정상 종료된 생성 작업을 정리할 관리 기능도 필요했습니다.',
      solution: '인증과 역할별 권한을 API·CMS에 함께 적용하고, 프론트엔드의 조회·렌더링 흐름에 맞춰 응답 구조를 정리했습니다. 생성 로그를 기준으로 팀·유저 통계를 조회하도록 수정하고, 이용 내역 다운로드와 생성 오류 초기화 기능을 CMS에 연결했습니다.',
      result: '관리자가 CMS에서 사용자·팀·콘텐츠를 관리하고 생성 통계와 이용 내역을 내려받을 수 있도록 구현했습니다. 오류 초기화 기능과 배포 후 QA까지 작업하며, 개별 API 구현을 넘어 실제 운영 과정에 필요한 기능을 연결하는 경험을 쌓았습니다.'
    },
    // Evidence: works' weekly project log, May–September 2026. Do not publish internal budget amounts.
    {
      id: 'developers-station', name: 'PlusX Developers · Station', icon: 'DS', brand: 'plusx', category: 'plusx', company: 'PlusX',
      role: '백엔드 설계·개발 · AWS 인프라 자동화 · 서비스 연동',
      period: '2026.05–2026.09',
      tags: ['AWS Lightsail', 'Route 53', 'S3', 'CloudFront', 'IAM', 'Celery', 'PostgreSQL', 'AWS Cost Explorer', 'AWS Budgets'],
      summary: 'AWS 인프라 생성 자동화, 승인·SSO·Station 연동 및 비용 조회 API 개발, S3·CloudFront 연동',
      description: '사내 프로젝트의 인프라 신청·승인·운영을 관리하는 Developers와, 프로젝트를 소개하고 버전별 릴리즈를 관리하는 Station을 연결한 서비스입니다. Developers에서는 서버·데이터베이스·SSO 신청과 비용 조회를, Station에서는 프로젝트 공개·릴리즈 노트·사용자 반응을 다룹니다. 인프라 생성 아키텍처 설계부터 두 서비스의 API 연동과 운영 화면 구현까지 참여했습니다.',
      contributions: [
        'Developers · 인프라 자동화: AWS Lightsail 인스턴스 생성·중지·재실행, 스냅샷 기반 생성, Route 53 매핑과 키 발급 로직을 개발했습니다. 서버 삭제 승인 시 인스턴스·DNS·키 페어를 함께 정리하고, PostgreSQL 설치 스냅샷 기반 생성과 RDB 신청·삭제 API를 구현했습니다.',
        'Developers · 결재·권한: 인스턴스·RDB·SSO 신청과 삭제 결재, 관리자 승인·반려 API를 개발했습니다. Station 최초 릴리즈·수정·미노출의 2단계 승인과 카테고리·접근 권한 그룹 관리 기능을 구현하고 관련 화면에 연동했습니다.',
        'Developers · 비용 조회: AWS Cost Explorer 기반 월별 실제 비용 조회 API를 구축하고, 총비용·전월 대비·연간 추이·서비스별 내역을 운영 화면에 연결했습니다. 신규 Lightsail 인스턴스·RDB에 비용 추적 태그를 자동 적용하고 AWS Budgets의 예산·사용률·잔여 금액을 연동했습니다.',
        'Station · 프로젝트·버전: 프로젝트·버전·릴리즈 테이블을 설계하고 최초 릴리즈, 정보·이미지 수정, 후속 버전 생성·삭제, 릴리즈 노트 수정 API를 개발했습니다. 프로젝트 노출 여부·순서를 Station에서 관리하도록 정리했습니다.',
        'Station · 탐색·반응: 메인 프로젝트 목록과 슬러그 기반 상세 API를 연동하고, 반응 조회·등록·해제 API와 화면을 구현했습니다. Developers에서도 Station의 반응 집계를 조회하도록 연결했습니다.',
        'Station · 이미지·배너: 히어로 배너 등록·수정·삭제·노출 순서와 S3 이미지 업로드·교체·정리를 구현했습니다. 프로젝트 이미지·스크린샷·첨부파일을 비공개 S3에서 관리하고 CloudFront Signed URL로 조회하도록 API를 개선했습니다.',
        '서비스 연동 · 승인 후 동기화: Developers에서 릴리즈·수정·삭제가 승인되면 Celery를 통해 Station API를 호출하도록 구현했습니다. 버전·릴리즈 노트 변경도 비동기로 동기화하고, 최초 릴리즈 버전 삭제를 차단했습니다. 서비스 간 Bearer Token 인증을 적용했습니다.',
        '인증·배포: 그룹웨어 SSO 로그인과 토큰 발급·삭제를 연동하고, SSO 삭제 결재·이력 처리를 구현했습니다. 스테이징 배포 환경과 Developers 프로덕션 서버를 설정하고, 이미지 접근과 반응 API 테스트를 추가했습니다.'
      ],
      problem: '프로젝트 서버를 생성하는 기능만으로는 신청·승인·중지·삭제와 비용 확인까지 관리하기 어려웠습니다. Developers의 승인 내역을 Station의 실제 게시 상태에 연결하면서, 릴리즈 정보와 이미지 접근 방식도 두 서비스에서 일관되게 처리할 필요가 있었습니다.',
      solution: '인프라의 생성부터 삭제까지 결재 상태에 맞춰 처리하고, 승인된 릴리즈 변경은 Celery 기반으로 Station에 전달했습니다. 노출 순서와 반응 데이터는 Station을 기준으로 관리하도록 정리했으며, 비공개 S3 파일은 CloudFront Signed URL로 조회했습니다. 운영 비용은 AWS 조회 API와 리소스 태그를 통해 화면에 연결했습니다.',
      result: '인프라 신청·승인·운영에서 프로젝트 릴리즈와 비용 조회까지 이어지는 관리 기능을 구현했습니다. Developers와 Station의 역할을 구분하면서 승인 결과와 게시 정보를 연동했고, 정적 목데이터로 구성된 화면을 실제 API 기반 운영 화면으로 전환했습니다.'
    },
    // Remaining PlusX details: works' weekly log and project self-review notes.
    // Preserve approved list summaries; include only documented work in each case study.
    {
      id: 'groupware', name: 'PlusX 그룹웨어', icon: 'GW', brand: 'plusx', category: 'plusx', company: 'PlusX',
      role: '백엔드 API · 관리자 기능 개선 · 운영·CS 대응', period: '2024.09–2026.07',
      tags: ['Python', 'Slack API', 'SSO', 'Nginx', 'Gunicorn'],
      summary: '사내 근태·휴가·전자결재 API 개발 및 스케줄러·Slack 알림·SSO 연동',
      description: '구성원의 출퇴근·휴가·전자결재와 조직 정보를 관리하는 사내 그룹웨어입니다. 운영 중인 서비스의 구조를 파악하고 CS·오류 대응을 수행하면서, 마이페이지와 관리자 기능을 개선했습니다. 근무제·휴가 정책 변경을 API와 스케줄러에 반영하고, Slack 알림과 다른 사내 서비스의 SSO 연결도 개발했습니다.',
      contributions: [
        '마이페이지 개선: 통합 API를 기능 단위로 분리하고 관련 로직을 리팩토링했습니다. 근태·휴가 조회, 캘린더와 대시보드에 필요한 데이터를 정리하고 화면 개선 과정에서 프론트엔드와 협업했습니다.',
        '관리자 기능: 월별 근태 통계·일일 출퇴근·조직 정보 조회 및 수정 API를 개발했습니다. 회사·팀·직급 관리와 CSV 다운로드를 구현하고, 관리자 앱 구조를 재정리했습니다.',
        '근무제·휴가 정책: 자율출퇴근·유연근무와 근속 연차 도입에 맞춰 출퇴근 검증, 인정 근무 시간, 결근·알림 스케줄러를 수정했습니다. 휴가·근태 화면과 결재 템플릿에 필요한 데이터도 반영했습니다.',
        'Slack 알림·스케줄러: 주요 이벤트와 퇴근 알림을 보내는 모듈을 개발하고, 오류 로그를 Slack으로 전달하도록 구성했습니다. 알림 만료·읽음 처리와 근태 관련 주기 작업도 관리했습니다.',
        '인증·사내 연동: 비동기 요청의 세션 검증을 추가하고, 사내 서비스 연동을 위한 SSO 토큰 발급·삭제 API와 프로필 정보 반환을 구현했습니다.',
        '운영 대응: 전자결재·근태 데이터 이슈를 분석하고 보정 스크립트를 작성했습니다. 근태·프로젝트 투입 리소스를 추출하고, 대량 조회 시 조회 기간과 Nginx·Gunicorn 타임아웃 설정을 조정했습니다.'
      ],
      problem: '기존 마이페이지의 통합 API를 개선하면서, 변화하는 근무제와 휴가 정책을 사용자 화면·관리자 화면·스케줄러에 함께 반영해야 했습니다. 운영 중 발생하는 오류와 구성원 문의에도 지속적으로 대응할 필요가 있었습니다.',
      solution: '마이페이지 API를 기능 단위로 나누고, 근태·휴가 정책의 영향을 받는 조회·검증·주기 작업을 함께 수정했습니다. 공통 알림 모듈과 Slack 오류 전달 기능을 구성하고, 데이터 보정·검증 스크립트를 운영 대응에 활용했습니다.',
      result: '근태·휴가·조직 관리 기능을 개선하고 변경된 사내 정책을 실제 서비스에 반영했습니다. 반복되는 알림과 오류 전달을 모듈화하며, 신규 기능 개발과 운영 유지보수를 함께 수행하는 경험을 쌓았습니다.'
    },
    {
      id: 'cgv', name: 'CGV 프로모션 웹사이트', icon: 'CGV', brand: 'cgv', category: 'plusx', company: 'PlusX · CGV',
      role: '백엔드 API 개발 · 환경 구축', period: '2024.10', tags: ['AWS', 'S3', 'REST API'],
      summary: '프로모션 이벤트의 이미지 생성·조회 API 개발 및 AWS S3·DB 연동과 배포 환경 구축',
      description: 'CGV 프로모션 웹사이트의 이미지 생성·조회 기능을 위한 백엔드 작업에 참여했습니다. 프로젝트 개발 환경을 구성하고, API와 저장소·데이터베이스를 연결해 스테이징 환경에 배포했습니다.',
      contributions: [
        '개발 환경: 프로젝트 초기 개발 환경을 설정하고 백엔드 기능을 구현할 기반을 구성했습니다.',
        '이미지 API: 프로모션에서 사용하는 이미지 생성·조회 API를 개발했습니다.',
        '저장소·배포: AWS S3와 데이터베이스를 연동하고 스테이징 배포 환경을 설정했습니다. 이후 프로젝트 코드를 리팩토링했습니다.'
      ],
      problem: '프로모션의 이미지 기능을 웹사이트에서 사용할 수 있도록 API와 저장소·데이터베이스, 배포 환경을 연결해야 했습니다.',
      solution: '이미지 생성·조회 API를 개발하면서 AWS S3·DB 연동과 스테이징 환경 설정을 함께 진행했습니다.',
      result: '이미지 기능을 제공하는 백엔드 API와 스테이징 배포 환경을 구성했습니다. 초기 환경 설정부터 외부 저장소 연동·배포까지 이어지는 작업을 수행했습니다.'
    },
    {
      id: 'deeponde', name: '디폰데 이벤트 Deeponde', icon: 'D', brand: 'deeponde', category: 'plusx', company: 'PlusX · Deeponde',
      role: '게임 API · 인증·접근 제어 · 배포·QA', period: '2025.03', tags: ['REST API', 'Middleware', '인증·접근 제어'],
      summary: '이벤트 게임 API 및 인증·비정상 요청 차단 로직 개발, 배포·QA 대응',
      description: '디폰데 프로모션의 이벤트 게임을 위한 백엔드를 개발했습니다. 게임 진행·종료 API와 함께 참여 흐름에 맞는 인증·접근 제어를 구현하고, 테스트용 API·문서화·프로덕션 QA와 배포를 수행했습니다.',
      contributions: [
        '게임 API: 게임 진행·종료 API와 검증을 위한 테스트용 API를 개발하고, 전체 API 테스트와 리팩토링을 진행했습니다.',
        '인증 흐름: 인증 없이 URL을 직접 호출하거나 게임 도중 특정 API에 무단 접근하는 요청을 제한하도록 인증 로직을 설계했습니다.',
        '비정상 요청 차단: 상품 수령의 반복 요청 등 게임 흐름을 벗어난 호출을 제어하는 미들웨어를 구현했습니다. 허용 도메인·클라이언트 검증도 적용했습니다.',
        '응답·배포: API 에러 형식과 상황별 응답 코드를 정리해 문서화했습니다. 스테이징 테스트, 프로덕션 배포·데이터베이스 업데이트와 QA 피드백에 대응했습니다.'
      ],
      problem: '이벤트 참여자가 게임 순서를 건너뛰거나 상품 수령 API를 반복 호출하는 등 정상적인 이용 흐름을 벗어나는 요청을 제어해야 했습니다.',
      solution: '게임 흐름을 고려한 인증과 미들웨어 접근 제한을 적용했습니다. 프론트엔드에서 실패 상황을 일관되게 처리할 수 있도록 에러 응답을 통일하고 테스트용 API로 검증했습니다.',
      result: '게임 API에 인증·비정상 요청 차단을 적용하고 프로덕션 배포와 QA를 수행했습니다. 화면에서 허용하는 동작뿐 아니라 API를 직접 호출하는 경우까지 고려해 이벤트 서비스를 구현했습니다.'
    },
    {
      id: 'another', name: 'Another Class', icon: 'A', brand: 'plusx', category: 'plusx', company: 'PlusX',
      role: '서비스 기획 참여 · 프론트엔드·백엔드 개발 · 배포', period: '2025.06–2025.12 · 2026.05 추가 개선',
      tags: ['SSE', 'Redis Pub/Sub', 'Celery', 'ASGI', 'Webhook', 'OpenAI Transcription API'],
      summary: 'AI 보이스 클로닝·음성 생성 웹 서비스 개발 및 SSE 기반 실시간 결과 전달 구현',
      description: 'AI 보이스 클로닝과 텍스트 기반 음성 생성으로 영상 포트폴리오 제작을 지원하는 웹 서비스입니다. 기획 단계부터 화면·인터랙션, 프로젝트·스크립트 데이터 구조와 API, 비동기 결과 전달, 배포 환경 구성까지 참여했습니다.',
      contributions: [
        '사용자 화면: 입력·생성 대기·결과 확인 단계의 UI와 인터랙션을 구현했습니다. 문단별 TTS 생성, 보이스 재생, 프로젝트 목록과 비디오 에디터 화면을 개발하고 피드백을 반영했습니다.',
        '데이터·API: 사용자 인증과 보이스·프로젝트·스크립트 테이블을 설계했습니다. 스크립트 생성·수정·삭제, 보이스 생성·조회, 프로젝트 개시·상태 확인 API를 구현했습니다.',
        '비동기 생성: TTS와 Voice Clone을 비동기 요청·Task·Webhook으로 연결했습니다. 보이스 클로닝 후 샘플 음성 생성, 결과 캐시 조회와 음성 파일 다운로드 로직도 추가했습니다.',
        '실시간 결과 전달: SSE와 Redis Pub/Sub 기반 이벤트 전달을 구현하고 ASGI·Celery 실행 환경을 설정했습니다. 생성 결과를 클라이언트로 전달하는 스트리밍 흐름을 구성했습니다.',
        '음성 인식·운영: OpenAI Transcription API를 연동한 Task를 개발했습니다. 예외 응답 구조와 API 문서를 정리하고 서비스 배포·테스트를 수행했으며, 이후 보이스 클로닝·음성 에디터 화면을 추가 개선했습니다.'
      ],
      problem: 'AI 추론에서 여러 결과가 나오는 특성상 클라이언트가 반복적으로 완료 여부를 조회하면 불필요한 요청이 늘어날 수 있었습니다. 사용자가 생성 대기와 결과 도착 상태를 화면에서 이해할 수 있어야 했습니다.',
      solution: 'SSE와 Redis Pub/Sub로 결과 이벤트를 전달하고, 비동기 Task·Webhook·캐시 조회를 연결했습니다. 화면도 입력·대기·결과 상태에 맞춰 피드백을 제공하도록 구성했습니다.',
      result: '생성 결과가 도착하면 클라이언트로 전달하는 기능을 구현하고 프로젝트·스크립트 관리에 연결했습니다. 서비스 특성에 맞는 통신 방식을 선택한 경험과 함께, 핵심 기능을 먼저 완성하고 단계적으로 확장하는 개발 범위 관리의 중요성을 배웠습니다.'
    },
    {
      id: 'tuniverse', name: 'T Universe Figma Plugin', icon: 'T', brand: 'figma', category: 'plusx', company: 'PlusX',
      role: 'AI 서비스 레이어 · 모델 파이프라인 · 인증·사용량 관리', period: '2025.06–2026.01',
      tags: ['Replicate', 'ComfyUI', 'Ollama', 'FAL', 'Redis', 'Celery', 'Webhook', 'HMAC'],
      summary: 'T 우주 운영용 아이콘 생성을 위한 AI 텍스트·이미지 생성 플러그인의 모델 연동 API 및 비동기 처리 개발',
      description: 'Figma에서 T 우주 운영용 아이콘과 이미지 제작을 돕는 AI 텍스트·이미지 생성 플러그인의 백엔드입니다. 클라우드 API와 내부 GPU 모델을 연결하고, 배경 제거·업스케일·회전·이미지 설명·3D 생성 등 여러 기능을 공통 실행 구조로 제공하도록 개발했습니다.',
      contributions: [
        '공통 서비스 레이어: Replicate 모델별 입력값·옵션을 추상화하고 실행 서비스 클래스를 설계했습니다. Ollama·Custom ComfyUI·FAL 연동을 추가하며 서로 다른 모델을 다룰 수 있는 구조로 확장했습니다.',
        '비동기 상태 관리: Redis에 모델 실행 상태를 관리하고 Celery Task, Webhook, 결과 확인 API를 구현했습니다. 이후 AI 서비스별 Webhook과 결과 조회를 분리했습니다.',
        '모델 파이프라인: 여러 모델의 실행을 연결하는 모듈과 결과 검증, Prediction 타임아웃 확인·취소 로직을 개발했습니다. 배너 생성용 텍스트·색상 추출·3D 아이콘 API와 이미지 처리 기능을 추가했습니다.',
        '클라이언트 인증: 계정 인증과 비로그인 트라이얼 정책을 설계했습니다. 트라이얼 토큰 발급에 HMAC·Nonce 검증을 적용하고, 클라이언트 검증·요청 제한으로 비정상 호출을 제어했습니다.',
        '사용량 관리: 로그인·트라이얼 사용자의 이용 횟수 제한과 사용 내역을 모델링했습니다. 사용량 초기화 스케줄러, 유저 일괄 생성과 로그·사용량 관리자 기능을 개발했습니다.',
        '배포·개선: 프록시와 Celery Beat 등 실행 환경을 구성하고 API 문서화·QA·재배포를 수행했습니다. 업로드 이미지 정리 스케줄러와 업스케일 전 투명 배경 병합 등 피드백 기반 개선도 반영했습니다.'
      ],
      problem: '모델마다 입력 옵션과 결과 형식·실행 시간이 달라 기능별로 연동하면 상태 관리와 오류 처리가 복잡해졌습니다. 플러그인의 비로그인 사용까지 지원하면서 요청 검증과 사용량 제한도 함께 필요했습니다.',
      solution: '모델 호출을 공통 서비스 레이어로 추상화하고 비동기 상태·Webhook·결과 검증을 연결했습니다. 계정·트라이얼 인증과 사용량 정책을 분리해 모델 실행 기능에 적용했습니다.',
      result: '여러 AI 모델을 공통 구조로 연동하고 실행 상태·결과·사용량을 관리하는 백엔드를 구현했습니다. 새로운 기능의 추가와 모델 교체를 고려한 구조를 만들었으며, 향후에는 실행·대기 시간 지표를 통해 사용자 체감 성능을 더 구체적으로 검증할 필요도 확인했습니다.'
    },
    {
      id: 'genai', name: 'PlusX GenAI', icon: 'G', brand: 'plusx', category: 'plusx', company: 'PlusX',
      role: '데이터 설계 · 서비스 API · 인증·운영 기능', period: '2025.08–2025.11', tags: ['SSO', 'REST API', 'Slack API'],
      summary: '사내 AI 이미지 생성 플랫폼의 데이터 구조 설계, 서비스 API 개발 및 SSO 연동',
      description: '사내에서 AI 이미지를 생성하고 라이브러리에서 탐색·활용하는 플랫폼입니다. 초기 환경 구성과 데이터 구조 설계, 그룹웨어 SSO 인증, 이미지 조회·다운로드·북마크 API와 서비스 운영 기능을 개발했습니다.',
      contributions: [
        '초기 구조·인증: 프로젝트 환경을 설정하고 테이블 설계·ERD를 작성했습니다. 그룹웨어 SSO를 연결하고 인증 API를 문서화했습니다.',
        '탐색 API: Theme·Function·Team 목록과 메인 화면의 랜덤 이미지 목록 API를 개발했습니다. 라이브러리 이미지 목록과 프롬프트 기반 필터링 기능을 추가했습니다.',
        '이미지 활용: 이미지 다운로드와 북마크 추가·삭제 API를 구현하고 스테이징 테스트·QA를 진행했습니다.',
        '운영 대응: 예외 핸들러를 커스터마이징하고 서버 오류를 Slack으로 전달하는 모듈을 개발했습니다. 시스템 로그·서비스 중단 상태 테이블과 관리 화면을 구성했습니다.',
        '서비스 중단 제어: 중단 여부를 캐시에 반영하고 이미지 생성 과정에서 확인하도록 구현했습니다. 클라이언트가 서비스 상태를 조회할 수 있는 API도 추가했습니다.'
      ],
      problem: '이미지 생성과 탐색 기능을 제공하면서 서비스 중단 여부를 생성 요청에 반영하고, 운영 중 발생하는 오류를 확인할 관리 기능이 필요했습니다.',
      solution: '중단 상태의 저장·캐시 반영·조회 API를 구성하고 생성 프로세스에 상태 검증을 추가했습니다. 시스템 관리 화면과 Slack 오류 알림을 연결해 운영자가 상태와 문제를 확인하도록 했습니다.',
      result: 'SSO 인증과 이미지 탐색·다운로드·북마크를 위한 API를 구현했습니다. 생성 기능뿐 아니라 중단 상태 관리와 오류 알림까지 추가하며, 운영을 고려한 사내 서비스 개발을 경험했습니다.'
    },
    {
      id: 'awards', name: 'PlusX Awards', icon: 'A', brand: 'plusx', category: 'plusx', company: 'PlusX',
      role: 'CMS 개발 · 접근 권한·SSO · 문서 출력', period: '2026.04–2026.05', tags: ['CMS', 'SSO', 'PDF'],
      summary: '사내 어워즈 출품작 관리 CMS 개발, SSO 연동 및 세금계산서 PDF 추출 기능 구현',
      description: '사내 어워즈 출품작을 등록·관리하는 CMS입니다. 초기 프로젝트·배포 환경을 구성하고, 그룹웨어 SSO와 접근 권한, 출품작 등록·목록 관리, 세금계산서 PDF 추출 기능을 개발했습니다. 운영 피드백에 맞춰 연도별 화면과 입력 항목도 개선했습니다.',
      contributions: [
        'CMS 기반 구성: 프로젝트 개요를 정리하고 CMS 개발과 배포 환경 구축을 진행했습니다. 초기 출품작 게시 기능을 개선한 뒤, 게시 사이트 분리에 맞춰 Awards 메뉴와 코드를 정리했습니다.',
        'SSO·권한: 그룹웨어 SSO를 연동하고 사용자 접근 권한 테이블과 관리 페이지를 구현했습니다.',
        '출품작 관리: 등록 폼과 목록 필터링을 업데이트했습니다. 인터뷰 피드백을 반영해 연도별 화면을 재구성하고 Dropbox 링크 입력 항목을 추가했습니다.',
        'PDF 출력: 출품작 관련 세금계산서를 PDF로 추출하는 기능을 개발하고 후속 수정 사항을 반영했습니다.'
      ],
      problem: '출품작 정보와 관련 서류를 관리하면서 사내 인증·접근 권한을 연결해야 했습니다. 운영 과정에서 연도별 탐색과 입력 항목에 대한 개선 요청도 발생했습니다.',
      solution: 'SSO와 권한 관리를 CMS에 적용하고 등록·필터링·PDF 추출 기능을 구현했습니다. 피드백을 기준으로 연도별 화면과 입력 항목을 수정하고, 분리된 출품작 게시 기능은 Awards에서 정리했습니다.',
      result: '출품작 관리와 관련 PDF 추출을 CMS에서 처리할 수 있도록 구현했습니다. 초기 개발 이후에도 운영자의 실제 업무와 피드백에 맞춰 관리 화면을 개선했습니다.'
    },
    // GNC source: works/지엔씨솔루션 프로젝트.pages. Existing dates and Envisager
    // authentication history are cross-checked against feature/1's about_modal.html.
    // Omit improvement percentages without measurement details.
    {
      id: 'emax', name: 'EMAX', icon: 'E', brand: 'emax', category: 'gnc', company: 'GNC Solution',
      role: '웹 풀스택 · DB 설계 · 예측 모듈 연동',
      tags: ['Python', 'Django', 'JavaScript', 'MariaDB', 'Pandas', 'django-apscheduler'],
      summary: '전력 소모량 예측 AI 서비스의 데이터 관리 웹과 학습·예측 스케줄러 개발',
      image: 'assets/image/work_project/emax.png',
      description: '전자 장비의 전력 소모 데이터를 관리하고 LSTM·Prophet 모델의 시간별·일별·월별 예측 결과를 확인하는 서비스입니다. 장비·알고리즘·상한선·학습 데이터와 예측 자동화를 관리하는 웹 파트를 단독으로 담당했습니다. AI 파트와 협업하며 예측 모듈을 서비스에 연결하고 데이터베이스와 관리 화면을 구현했습니다.',
      contributions: [
        '웹·데이터 설계: Django와 JavaScript로 웹 화면과 백엔드를 개발하고, MariaDB 기반 테이블 구조를 설계했습니다. 장비·학습 데이터·예측 작업을 관리하는 웹 파트를 담당했습니다.',
        '예측 모듈 연동: AI 파트와 협업해 모델을 프로젝트에 적용했습니다. Python·Pandas로 학습·추론 호출, 모델 파일 저장, 예측 데이터 처리 로직을 모듈화했습니다.',
        '스케줄러 전환: MariaDB Event Scheduler와 프로시저에 의존하던 작업을 django-apscheduler 기반 Custom Scheduler로 변경했습니다. 작업 로직과 스케줄러를 Django에서 관리하도록 구성했습니다.',
        '사용자 제어: 관리 화면에서 작업 일정을 동적으로 변경하도록 구현했습니다. cron 방식의 시간 설정을 연결해 사용자가 학습·예측 작업의 실행 시점을 관리할 수 있도록 했습니다.'
      ],
      problem: '기존 DB Event Scheduler는 복잡한 프로시저에 의존해 작업 내용을 파악하거나 수정하기 어려웠습니다. 사용자가 화면에서 일정을 관리할 수 없어 스케줄 변경도 개발 작업에 의존했습니다.',
      solution: 'django-apscheduler로 스케줄링을 옮기고 학습·추론·저장·예측 데이터 처리를 모듈로 분리했습니다. 관리 화면과 cron 기반 시간 설정을 연결해 작업 일정을 사용자 기능으로 제공했습니다.',
      result: '스케줄과 실행 로직을 Django에서 함께 관리하고, 화면에서 작업 시간을 변경할 수 있도록 구현했습니다. AI 모델 자체의 연구·개발과 구분되는 데이터 관리·모델 연동·예측 자동화의 웹 개발 경험을 쌓았습니다.'
    },
    {
      id: 'performance', name: 'Build Performance', icon: 'B', brand: 'buildpay', category: 'gnc', company: 'GNC Solution · 빌드텍',
      role: 'GraphQL 앱 API · 관리자 웹 · 비동기 작업', period: '2023.08–2023.10',
      tags: ['Python', 'Django', 'JavaScript', 'GraphQL', 'MariaDB', 'Celery', 'Celery Beat', 'Gunicorn', 'Nginx'],
      summary: 'BuildPay 연동 채굴기 관리 앱의 GraphQL API 및 주기적 보상 처리 개발',
      image: 'assets/image/work_project/build_performance.png',
      description: '전자지갑 BuildPay와 연결되는 채굴기 관리 앱입니다. 채굴기 등급에 따른 채굴량을 주기적으로 누적하고 BuildPay에서 입출금할 수 있는 서비스로, 앱 API와 관리자 웹·데이터베이스, 보상 계산을 위한 주기 작업을 개발했습니다.',
      contributions: [
        '앱 API: 앱 프론트엔드와 협업해 GraphQL 기반 백엔드 API를 개발하고, MariaDB로 서비스 데이터를 관리하도록 구현했습니다.',
        '관리자 웹: Django·JavaScript를 사용해 관리자 페이지의 프론트엔드와 백엔드를 개발했습니다.',
        '보상 처리: 10분 주기의 등급별 채굴량 누적, 추천인 보상 분배와 등급별 분배량 계산을 Celery Task로 구현했습니다.',
        '스케줄링 개선: DB 프로시저의 작업 로직을 Python으로 옮기고 Celery Beat로 실행 주기를 관리했습니다. 비동기 작업 큐를 적용하고 실행 내역·오류 로그를 기록하도록 구성했습니다.',
        '서버 운영: Gunicorn·Nginx 기반 웹 서버를 관리하고 배포 작업을 수행했습니다.'
      ],
      problem: '주기마다 여러 사용자의 보상 데이터를 처리해야 했지만, 기존 DB Event Scheduler와 복잡한 프로시저 기반 구현은 작업 분산과 유지보수에 제약이 있었습니다.',
      solution: 'Celery Beat가 주기적으로 작업을 예약하고 Celery Task가 처리하도록 변경했습니다. SQL에 있던 계산 로직을 Python으로 옮겨 Django 프로젝트에서 관리하고 실행 내역과 오류 로그를 남겼습니다.',
      result: '주기적 보상 처리를 비동기 작업 큐로 분산할 수 있는 구조로 전환했습니다. 계산 로직·스케줄·실행 기록을 함께 관리하면서 기능 변경과 오류 원인 확인을 위한 기반을 정리했습니다.'
    },
    {
      id: 'envisager', name: 'Envisager', icon: 'EN', brand: 'envisager', category: 'gnc', company: 'GNC Solution',
      role: '웹 풀스택 · REST 앱 API · JWT 인증', period: '2023.06–2023.11',
      tags: ['Python', 'Django', 'JavaScript', 'DRF', 'SimpleJWT', 'MariaDB', 'Gunicorn', 'Nginx'],
      summary: '예술 작품 등록·판매 플랫폼의 웹·앱 API 개발 및 JWT 인증 적용',
      image: 'assets/image/work_project/envisager.png',
      description: '작가의 디지털 작품 등록·판매와 사용자의 작품 구매·컬렉팅을 연결하는 예술 플랫폼입니다. 작품의 굿즈 제품화와 전시 등으로 이어지는 서비스를 위해 웹 풀스택 개발과 앱 백엔드 API, 데이터베이스·서버 운영을 담당했습니다.',
      contributions: [
        '웹 개발: Django와 JavaScript로 플랫폼 웹 페이지의 프론트엔드·백엔드를 개발했습니다.',
        '앱 API: 앱 프론트엔드와 협업해 Django REST Framework 기반 API를 개발하고 웹·앱의 서비스 연동을 지원했습니다.',
        '인증 전환: 기존 세션 기반 인증을 앱 환경으로 확장하기 위해 DRF SimpleJWT를 적용했습니다. JWT 토큰 기반으로 인증을 처리하도록 관련 로직을 정리했습니다.',
        '데이터·배포: MariaDB 기반 데이터 구조를 구현하고 Gunicorn·Nginx로 웹 서버를 관리·배포했습니다.'
      ],
      problem: '기존 세션 기반 사용자 인증을 앱 로그인까지 확장하면서, 웹·앱의 인증 흐름과 관련 로직을 일관되게 관리할 필요가 있었습니다.',
      solution: 'DRF SimpleJWT를 도입해 토큰 기반 인증으로 전환했습니다. 앱 API 개발 과정에서 프론트엔드와 인증 방식을 맞추고 웹·앱에서 활용하는 인증 로직을 정리했습니다.',
      result: 'JWT 기반 인증을 적용해 웹과 앱의 인증 로직을 일관된 방식으로 관리할 수 있도록 구성했습니다. 웹 화면 개발뿐 아니라 앱 API 협업과 인증 구조 변경, 서버 배포까지 경험했습니다.'
    },
    {
      id: 'buildpay', name: 'BuildPay', icon: 'B', brand: 'buildpay', category: 'gnc', company: 'GNC Solution · 빌드텍',
      role: 'GraphQL 앱 API · 쇼핑몰 REST API · 관리자 웹', period: '2022.08–2023.02 / 2023.05–08 고도화',
      tags: ['Python', 'Django', 'JavaScript', 'GraphQL', 'REST API', 'MariaDB', 'Pandas', 'Gunicorn', 'Nginx'],
      summary: '가상화폐 전자지갑 앱의 GraphQL API와 연동 쇼핑몰의 REST API 개발',
      image: 'assets/image/work_project/buildpay.png',
      description: '여러 종류의 가상화폐를 멀티 지갑으로 관리하고 입출금하는 전자지갑 앱입니다. 일부 코인을 포인트로 전환해 전용 쇼핑몰 Build Mall에서 사용할 수 있습니다. 앱 백엔드와 쇼핑몰 연동 API, 관리자 웹·데이터베이스·서버 운영을 담당했습니다.',
      contributions: [
        '앱 API: 앱 프론트엔드와 협업해 전자지갑 서비스의 GraphQL 기반 백엔드 API를 개발했습니다.',
        '쇼핑몰 연동: Build Mall의 웹 백엔드 REST API를 개발해 전자지갑과 연결되는 쇼핑몰 서비스를 지원했습니다.',
        '관리자·데이터: Django·JavaScript로 관리자 웹의 프론트엔드·백엔드를 개발하고 MariaDB 기반 데이터 구조를 구현했습니다.',
        '엑셀 내보내기: Pandas와 ExcelWriter로 데이터 목록을 엑셀 파일로 저장하는 기능을 구현했습니다. 다른 프로젝트에서도 재사용·확장할 수 있도록 공통 모듈로 정리했습니다.',
        '운영·배포: Gunicorn·Nginx 기반 웹 서버를 관리하고 서비스 배포를 수행했습니다.'
      ],
      problem: '여러 프로젝트에서 데이터 목록의 엑셀 저장이 필요했지만 구현 방식이 달라 기능을 추가하거나 수정할 때 반복 작업이 발생했습니다.',
      solution: 'Pandas와 ExcelWriter를 활용해 엑셀 내보내기 기능을 구현하고 공통 모듈로 분리했습니다. 프로젝트마다 개별 구현을 반복하지 않고 같은 방식으로 활용·확장할 수 있도록 정리했습니다.',
      result: '전자지갑 앱·쇼핑몰 API와 관리자 웹을 개발하고, 엑셀 저장 기능을 재사용 가능한 모듈로 만들었습니다. 개별 서비스 기능을 구현하면서 여러 프로젝트에 공통으로 필요한 작업도 함께 개선했습니다.'
    },
    { id: 'enjo', name: 'Enjo-Eat', icon: 'EE', brand: 'enjo', logo: 'assets/image/personal_project/enjo-eat-icon.png', category: 'personal', company: '개인 프로젝트', role: '기획 · 디자인 · 개발', period: '2022.09.20–2022.10.16', tags: ['Django', 'JavaScript', 'Selenium', 'MariaDB', 'Kakao Map API'], summary: '음식점과 메뉴를 쉽고 즐겁게 고르는 서비스', image: 'assets/image/enjo_eat/main2.png', github: 'https://github.com/hyewwon/Enjo_eat', description: '점심 메뉴를 정하기 어려웠던 경험에서 시작했습니다. 지역이나 목적별로 음식점을 모으고, 다른 사용자와 공유하며 선택할 수 있습니다.', contributions: ['Django와 JavaScript 기반의 서비스 기획·개발', 'Kakao Map API로 음식점 위치·이름 입력 지원', 'Selenium 기반 이미지 검색·등록 기능 구현'], problem: '식당과 메뉴를 고르는 고민을 줄이고, 음식점을 등록하는 과정도 편리하게 만들고 싶었습니다.', solution: '음식점 그룹과 선택 기능을 만들고 지도 입력과 이미지 검색 기능을 연결했습니다.', result: '기획한 아이디어를 하나의 서비스로 구현하며 Django와 JavaScript의 실무 활용 경험을 쌓았습니다.' },
    {
      id: 'finalsay', name: 'FinalSay', icon: 'F', brand: 'finalsay', category: 'personal', company: '개인 프로젝트',
      role: '백엔드 API · AI 연동 · 배포 구성',
      logo: 'assets/image/personal_project/finalsay-icon.png',
      tags: ['Python', 'Django', 'DRF', 'PostgreSQL', 'OpenAI', 'Celery', 'Redis', 'Firebase', 'Docker', 'Gunicorn', 'Nginx'],
      summary: '찬반 토론과 투표를 모아 AI가 결과와 근거를 정리하는 앱',
      description: '관심 있는 주제에 찬반 의견을 남기고 투표·공감으로 참여하는 토론 앱입니다. 토론이 종료되면 AI가 양측 주장을 바탕으로 판결 요약과 근거를 생성합니다. Flutter 앱과 연결되는 Django 백엔드에서 토론·회원·투표 데이터를 관리하고, AI 처리와 알림·광고 보상 기능을 구현했습니다.',
      contributions: [
        '토론 API: 주제·주장·공감·투표·신고·판결 데이터를 설계하고, 카테고리·국가별 목록과 참여 이력·검색 API를 구현했습니다.',
        '소셜 인증: Google·Apple의 인증 토큰을 검증하고 SimpleJWT 기반 앱 로그인과 사용자 프로필·국가 정보 관리를 연결했습니다.',
        'AI 판결: 만료된 토론의 주장을 OpenAI에 전달하고 판결 요약·근거를 생성합니다. 응답 JSON의 필수 값과 자료형을 검증한 뒤 저장하며, 주제별 판결 결과가 중복 저장되지 않도록 처리했습니다.',
        '주기 작업·알림: Celery로 판결 생성과 국가별 시간대 기준 투표권 초기화를 처리하고, 판결 완료 후 참여자에게 Firebase Cloud Messaging 알림을 전달하도록 구성했습니다.',
        '광고 보상: AdMob 서버 측 검증(SSV)의 서명을 확인하고 거래 ID로 중복 보상 요청을 구분해 투표권 지급에 연결했습니다.',
        '배포 구성: Docker Compose로 Django·Gunicorn, Celery Worker·Beat, Redis·Nginx를 구성하고 HTTPS와 배포·상태 점검 스크립트를 정리했습니다.'
      ],
      problem: '사용자의 토론 참여 이후 AI 결과 생성과 알림까지 이어져야 하고, 판결·광고 보상처럼 반복 요청이 들어올 수 있는 작업을 일관되게 처리할 필요가 있었습니다.',
      solution: 'AI 판결 생성은 Celery 주기 작업으로 분리하고 응답을 검증한 후 저장했습니다. 주제별 판결 관계와 트랜잭션으로 중복 저장을 방지하고, 광고 보상은 서명 검증과 거래 ID 기반 중복 확인을 적용했습니다.',
      result: '토론 참여부터 AI 판결 조회·알림까지 이어지는 백엔드를 구현했습니다. 국가별 시간대 처리, 외부 인증과 광고 보상 검증, 컨테이너 배포 구성을 함께 연결했습니다.'
    },
    // Team features are verified against the linked repositories, not individual
    // ownership claims. Only README-confirmed development dates are displayed.
    {
      id: 'opd', name: 'Our Project Diary', icon: 'OPD', brand: 'opd', category: 'team', company: '팀 프로젝트', role: '팀 개발',
      tags: ['Python', 'Django', 'JavaScript', 'Bootstrap'],
      github: 'https://github.com/hyewwon/OPD_Project2',
      summary: '개발 프로젝트 기록과 팀원 모집을 연결하는 Our Project Diary',
      description: '개발자가 프로젝트를 기록하고 함께할 팀원을 모집하는 플랫폼입니다. 개발자와 기업 프로필, 프로젝트 문서, 기술별 모집 정보를 연결해 프로젝트 탐색부터 참여까지 이어지도록 구성한 Django 기반 팀 프로젝트입니다.',
      contributions: [
        '프로젝트 관리: 프로젝트 생성·수정·삭제, 공개 여부 설정과 제목·내용·참여자·기술별 검색 및 페이지네이션을 구현했습니다.',
        '자료 공유: 프로젝트 썸네일과 문서를 업로드하고, 원본 파일명을 유지한 문서 다운로드를 제공합니다.',
        '팀원 모집: 프로젝트와 모집 정보를 연결하고 필요한 기술과 인원을 관리하는 구조를 구성했습니다.',
        '커뮤니티: 개발자·기업 프로필, 관심 프로젝트, 댓글·답글을 통해 프로젝트에 대한 소통을 지원합니다.'
      ],
      problem: '프로젝트 소개, 개발 자료와 팀원 모집 정보를 한곳에서 확인하고 관리할 수 있는 공간을 만드는 것이 목표였습니다.',
      solution: 'Django 모델로 프로젝트·참여자·기술·문서·모집 정보의 관계를 구성하고, 검색·파일 공유·댓글 기능을 연결했습니다.',
      result: '프로젝트를 등록하고 자료를 공유하며 팀원 모집으로 이어지는 웹 기능을 구현했습니다. 개발자와 기업이 같은 프로젝트 정보를 서로 다른 프로필로 탐색할 수 있습니다.'
    },
    {
      id: 'mango', name: 'MANGO', icon: 'M', brand: 'mango', category: 'team', company: '팀 프로젝트', role: '팀 개발',
      logo: 'assets/image/team_project/mango-logo.png',
      image: 'assets/image/team_project/mango-features.png', imageCaption: '저장소의 음악·챗봇 기능 안내',
      tags: ['Python', 'Django', 'TensorFlow', 'Keras', 'Pandas', 'BeautifulSoup', 'JavaScript'],
      github: 'https://github.com/hyewwon/MANGO',
      summary: '대화 속 감정·날씨·취향을 분석해 음악을 추천하는 챗봇 서비스',
      description: '음악 탐색과 추천 챗봇을 결합한 팀 프로젝트입니다. 곡·아티스트·앨범 정보를 검색하고, 대화의 의도와 감정, 날씨 또는 플레이리스트의 가사 분위기를 바탕으로 음악을 추천합니다. Django 웹과 Python 챗봇 서버를 연결하는 형태로 구현했습니다.',
      contributions: [
        '음악 탐색: BeautifulSoup으로 차트·곡·앨범·아티스트 정보를 수집하고 Django 화면과 검색 응답에 연결했습니다.',
        '대화 분석: 의도 분류·개체명 인식과 감정·날씨 분석 모델을 조합해 사용자 요청에 맞는 응답을 구성했습니다.',
        '취향 추천: 플레이리스트의 가사 분위기를 분석하고, 감정·날씨·취향에 맞는 음악 추천 결과를 제공합니다.',
        '챗봇 연동: 소켓 기반 Python 서버에서 요청을 받아 분석 결과와 추천 정보를 JSON으로 반환합니다. 분류 보완을 위한 입력 문장·라벨 저장 기능도 포함했습니다.'
      ],
      problem: '곡명을 직접 입력하는 검색뿐 아니라, 지금의 기분이나 날씨처럼 일상적인 표현으로 음악을 찾을 수 있도록 기획했습니다.',
      solution: '사용자 문장에서 의도와 개체명을 추출하고 감정·날씨·가사 분석 결과를 음악 탐색 기능과 연결했습니다.',
      result: '대화 입력에서 분석·추천 결과 표시로 이어지는 음악 챗봇을 구현했습니다. 여러 분석 모델과 웹 데이터 수집 기능이 하나의 서비스에서 동작하도록 구성했습니다.'
    },
    {
      id: 'akbocado', name: 'Akbocado', icon: 'A', brand: 'akbocado', category: 'team', company: '팀 프로젝트', role: '팀 개발',
      logo: 'assets/image/team_project/akbocado-logo.png',
      image: 'assets/image/team_project/akbocado-logo.png', imageCaption: '원본 프로젝트 로고',
      tags: ['Python', 'Django', 'OpenCV', 'TensorFlow', 'NumPy', 'OCR', 'JavaScript'],
      github: 'https://github.com/hyewwon/Akbocado',
      summary: '악보 이미지에서 곡 정보와 음표를 인식하는 OCR 웹 서비스',
      description: '악보를 업로드하면 제목·작사 및 작곡 정보·가사·음표를 분석하는 팀 프로젝트입니다. 이미지 처리와 OCR 결과를 웹에서 확인하고 관련 곡을 검색할 수 있도록 구성했습니다. 일반 이미지·악보·음악 화면 이미지를 구분하는 업로드 검사 기능도 포함합니다.',
      contributions: [
        '이미지 업로드: 드래그 앤 드롭 업로드와 미리보기·분석 중 화면을 구성하고, Ajax로 입력 이미지의 유형을 확인합니다.',
        '악보 분석: 제목·작사 및 작곡 정보·가사 영역의 OCR 결과를 유형별 JSON 응답으로 전달합니다.',
        '음표 인식: OpenCV 기반 노이즈·오선 제거, 정규화, 객체 검출과 인식을 거쳐 음의 높이와 박자 정보를 추출합니다.',
        '곡 정보 연결: 분석 결과를 표시하고 제목·아티스트 기반 음악 검색을 연결해 관련 곡을 탐색할 수 있도록 했습니다.'
      ],
      problem: '이미지로만 존재하는 악보에서 곡 정보와 음표를 추출하고, 사용자가 브라우저에서 결과를 확인할 수 있도록 기획했습니다.',
      solution: '입력 이미지 분류, OpenCV 전처리와 OCR·음표 인식을 단계별로 연결하고 분석 결과를 Django 웹 화면에 전달했습니다.',
      result: '악보 업로드부터 항목별 분석 결과 확인과 곡 검색까지 이어지는 웹 기능을 구현했습니다. 이미지 처리 모듈의 출력을 사용자 화면과 연결한 팀 프로젝트입니다.'
    },
    {
      id: 'reshop', name: 'Reshop', icon: 'R', brand: 'reshop', category: 'team', company: '팀 프로젝트', role: '팀 개발',
      logo: 'assets/image/team_project/reshop-logo.png',
      image: 'assets/image/team_project/reshop-logo.png', imageCaption: '원본 프로젝트 로고',
      tags: ['Java', 'JSP', 'Servlet', 'MyBatis', 'JavaScript', 'jQuery'],
      github: 'https://github.com/hyewwon/Reshop',
      summary: '중고·업사이클링 상품과 기부 소식을 다루는 쇼핑몰',
      description: '중고·업사이클링 상품을 탐색하고 주문하는 쇼핑몰 팀 프로젝트입니다. 회원·상품·장바구니·주문 기능에 공지·문의·기부 소식 게시판을 더하고, 관리자가 상품과 주문 정보를 관리하는 Java·JSP 기반 웹으로 구성했습니다.',
      contributions: [
        '회원 기능: 회원가입·로그인과 프로필 수정, 계정 정보 관리 기능을 구성했습니다.',
        '상품·주문: 상품 탐색과 장바구니, 배송 정보 입력 및 주문 저장을 연결하고 주문 후 장바구니를 정리합니다.',
        '관리자 웹: 상품·주문·회원 정보를 조회하고 관리하는 페이지와 서버 처리를 구현했습니다.',
        '게시판: 공지·문의·기부 소식에 게시글·댓글·첨부파일을 연결하고, Servlet의 요청 처리와 MyBatis 데이터 접근을 분리했습니다.'
      ],
      problem: '상품 구매와 재사용·나눔 관련 정보를 함께 제공하는 쇼핑몰을 목표로, 회원부터 주문까지 이어지는 기능이 필요했습니다.',
      solution: 'JSP 화면, Servlet 기반 요청 처리, DAO와 MyBatis 쿼리를 나누고 상품·장바구니·주문·관리자 기능을 연결했습니다.',
      result: '고객의 상품 탐색·주문과 관리자의 운영 기능을 갖춘 쇼핑몰 웹을 구현했습니다. 게시판과 첨부파일 처리를 포함해 여러 기능이 연결되는 Java 웹 프로젝트를 구성했습니다.'
    },
    {
      id: 'twith', name: 'Twith', icon: 'T', brand: 'twith', category: 'team', company: '팀 프로젝트', role: '팀 개발', period: '2021.09.08–2021.10.07',
      logo: 'assets/image/team_project/twith-logo.png',
      image: 'assets/image/team_project/twith-logo.png', imageCaption: '원본 프로젝트 로고',
      tags: ['Java', 'Spring Framework', 'MyBatis', 'Oracle', 'JavaScript', 'jQuery', 'Kakao Map API'],
      github: 'https://github.com/hyewwon/Twith',
      summary: '테마별 여행 모임을 모집하고 함께 여행할 사람을 찾는 커뮤니티',
      description: '새로운 사람들과 여행할 수 있도록 테마별 모임과 여행자 커뮤니티를 제공하는 팀 프로젝트입니다. 모임 개설·참여 신청·승인, 장소 지도와 여행 정보 게시판을 연결한 Spring Framework 기반 웹 서비스입니다.',
      contributions: [
        '여행 모임: 모임 생성·수정과 테마별 모집 게시글, 페이지네이션 및 모임 상세 화면을 구성했습니다.',
        '참여 관리: 지원자 신청과 모임장의 승인·거절, 참여자 조회 및 관리 기능을 연결했습니다.',
        '장소·소통: Kakao Map API로 모임 장소를 안내하고, 모임 대화·댓글과 여행 정보 게시판을 제공합니다.',
        '서버·데이터: Spring MVC의 Controller·Service와 MyBatis를 연결하고 Oracle에 회원·모임·게시글 정보를 관리합니다.'
      ],
      problem: '테마가 맞는 여행 동행을 찾고, 모집 이후의 참여자 관리와 소통까지 이어지는 커뮤니티를 만드는 것이 목표였습니다.',
      solution: '모임·장소·모집글·참여 신청 데이터를 구분해 연결하고, 신청·승인 과정과 지도·댓글 기능을 웹에 구성했습니다.',
      result: '여행 모임을 만들고 지원자를 모집·승인하며 모임 안에서 소통하는 기능을 구현했습니다. 여행 정보 탐색과 모임 참여가 연결되는 웹 프로젝트를 구성했습니다.'
    },
  ];
  const content = root.querySelector('[data-store-content]');
  const viewport = root.querySelector('[data-store-viewport]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let slide = null;
  const discovery = root.querySelector('[data-store-discovery]');
  const detail = root.querySelector('[data-store-detail]');
  const search = root.querySelector('[data-store-search]');
  const list = root.querySelector('[data-store-list]');
  const categories = { featured: '주요 프로젝트', plusx: 'PlusX', gnc: 'GNC Solution', team: 'Team Project', personal: 'Personal Project' };
  const featuredIds = ['kb', 'samsung-ai', 'developers-station', 'emax'];
  let category = 'featured';
  let savedScroll = 0;
  let activeProject = null;
  const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  // Black +X image: https://www.brandb.net/agency/플러스엑스 (image fileId=1685).
  // Crop the source's white margins in the UI; retain the original image pixels.
  // Other project icons keep uppercase initial fallbacks.
  const icon = project => `<span class="store-app-icon store-app-icon--${project.brand}" aria-hidden="true">${project.logo ? `<span class="store-project-logo"><img src="${escape(project.logo)}" alt=""></span>` : project.brand === 'plusx' ? '<span class="store-plusx-logo"><img src="assets/image/brand/logo/plusx-black-source.png" width="870" height="240" alt=""></span>' : escape(project.icon.toUpperCase())}</span>`;
  function finishSlide(restoreFocus = false) {
    if (!slide) return;
    const current = slide;
    slide = null;
    current.animation.cancel();
    current.snapshot.remove();
    delete viewport.dataset.slideDirection;
    content.inert = current.wasInert;
    if (restoreFocus) current.focus();
  }
  function captureView() {
    if (reducedMotion.matches || !content.animate) return null;
    const snapshot = content.cloneNode(true);
    snapshot.className = 'store-slide-snapshot';
    for (const element of [snapshot, ...snapshot.querySelectorAll('*')]) {
      for (const attribute of [...element.attributes]) {
        if (attribute.name === 'id' || attribute.name.startsWith('data-') || attribute.name === 'aria-live') element.removeAttribute(attribute.name);
      }
    }
    snapshot.inert = true;
    snapshot.setAttribute('aria-hidden', 'true');
    snapshot.style.padding = getComputedStyle(content).padding;
    viewport.append(snapshot);
    snapshot.scrollTop = content.scrollTop;
    return snapshot;
  }
  function slideView(direction, snapshot, focus) {
    if (!snapshot) { focus(); return; }
    viewport.dataset.slideDirection = direction;
    const wasInert = content.inert;
    if (content.contains(document.activeElement)) viewport.focus({ preventScroll: true });
    content.inert = true;
    const target = direction === 'forward' ? content : snapshot;
    const positions = direction === 'forward' ? ['translateX(100%)', 'translateX(0)'] : ['translateX(0)', 'translateX(100%)'];
    const animation = target.animate(positions.map(transform => ({ transform })), {
      duration: direction === 'forward' ? 380 : 320,
      easing: 'cubic-bezier(.22, .7, .2, 1)', fill: 'both'
    });
    const current = { animation, snapshot, focus, wasInert };
    slide = current;
    animation.finished.then(() => { if (slide === current) finishSlide(true); }, () => { if (slide === current) finishSlide(true); });
  }
  // Resize/category changes settle the current view instead of leaving a stale overlay.
  new ResizeObserver(() => finishSlide(true)).observe(viewport);
  window.addEventListener('resize', () => finishSlide(true));
  reducedMotion.addEventListener('change', () => finishSlide(true));
  function renderList() {
    const term = search.value.trim().toLocaleLowerCase();
    const candidates = category === 'featured' ? featuredIds.map(id => projects.find(p => p.id === id)) : projects.filter(p => p.category === category);
    const matches = candidates.filter(p => `${p.name} ${p.company} ${p.summary} ${p.tags.join(' ')}`.toLocaleLowerCase().includes(term));
    const showEditorial = category === 'featured' && !term;
    discovery.hidden = false;
    detail.hidden = true;
    activeProject = null;
    root.querySelector('[data-store-heading]').textContent = term ? '검색 결과' : categories[category];
    root.querySelector('[data-store-count]').textContent = `${matches.length}개의 프로젝트`;
    root.querySelector('[data-store-editorial]').hidden = !showEditorial;
    root.querySelector('.store-library').hidden = showEditorial;
    list.innerHTML = matches.map(p => `<button class="store-app-row" type="button" data-project-id="${p.id}">${icon(p)}<span class="store-app-row__text"><strong>${escape(p.name)}</strong><span>${escape(p.summary)}</span><small>${escape(p.company)}</small></span><span class="store-get">보기</span></button>`).join('');
    const empty = root.querySelector('[data-store-empty]');
    empty.hidden = matches.length !== 0;
    empty.textContent = term ? '검색 결과가 없습니다. 다른 프로젝트명이나 기술로 검색해 보세요.' : '아직 등록된 프로젝트가 없습니다.';
    root.querySelectorAll('[data-store-category]').forEach(button => {
      const selected = button.dataset.storeCategory === category;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  }
  function openProject(id) {
    const p = projects.find(p => p.id === id);
    if (!p || activeProject || slide) return;
    savedScroll = content.scrollTop;
    const snapshot = captureView();
    activeProject = id;
    discovery.hidden = true;
    detail.hidden = false;
    detail.innerHTML = `<button type="button" class="store-back" data-store-action="back">〈 프로젝트</button>
      <header class="store-detail__heading">${icon(p)}<div><h2 tabindex="-1">${escape(p.name)}</h2><p>${escape(p.summary)}</p>${p.github ? `<a class="store-external" href="${p.github}" target="_blank" rel="noopener noreferrer">GitHub 보기 ↗</a>` : ''}</div></header>
      <dl class="store-facts"><div><dt>소속 · 프로젝트</dt><dd>${escape(p.company)}</dd></div><div><dt>${p.category === 'team' ? '참여 형태' : '담당 역할'}</dt><dd>${escape(p.role)}</dd></div>${p.period ? `<div><dt>개발 기간</dt><dd>${escape(p.period)}</dd></div>` : ''}</dl>
      ${p.image ? `<figure class="store-screenshot"><img src="${p.image}" alt="${escape(p.name)} · ${escape(p.imageCaption || '서비스 화면')}"><figcaption>${escape(p.name)} · ${escape(p.imageCaption || '서비스 화면')}</figcaption></figure>` : ''}
      <section class="store-detail__section"><h3>프로젝트 소개</h3><p>${escape(p.description)}</p></section>
      <section class="store-detail__section"><h3>${p.category === 'team' ? '팀 프로젝트의 주요 구현' : '내가 맡은 일'}</h3><ul>${p.contributions.map(item => `<li>${escape(item)}</li>`).join('')}</ul></section>
      ${p.problem ? `<section class="store-case"><h3>개발 이야기</h3><div><h4>${p.category === 'team' ? '프로젝트 목표' : '해결할 문제'}</h4><p>${escape(p.problem)}</p></div><div><h4>설계와 구현</h4><p>${escape(p.solution)}</p></div><div><h4>${p.category === 'team' ? '구현 범위' : '적용 결과'}</h4><p>${escape(p.result)}</p></div></section>` : ''}
      ${p.tags.length ? `<section class="store-detail__section"><h3>사용 기술</h3><p class="store-tags">${p.tags.map(escape).join(' · ')}</p></section>` : ''}`;
    content.scrollTop = 0;
    slideView('forward', snapshot, () => detail.querySelector('h2').focus({ preventScroll: true }));
  }
  function back() {
    if (!activeProject) return;
    finishSlide();
    const id = activeProject;
    const snapshot = captureView();
    renderList();
    content.scrollTop = savedScroll;
    slideView('back', snapshot, () => {
      const trigger = [...discovery.querySelectorAll(`[data-project-id="${id}"]`)].find(button => button.getClientRects().length);
      trigger?.focus({ preventScroll: true });
    });
  }
  root.addEventListener('click', event => {
    const project = event.target.closest('[data-project-id]');
    if (project) openProject(project.dataset.projectId);
    const filter = event.target.closest('[data-store-category]');
    if (filter) { finishSlide(); category = filter.dataset.storeCategory; renderList(); content.scrollTop = 0; }
    const action = event.target.closest('[data-store-action]');
    if (action?.dataset.storeAction === 'back') back();
    if (action?.dataset.storeAction === 'close') { finishSlide(); root.classList.add('is-closed'); document.querySelector('[data-projects-open]').focus(); }
    if (action?.dataset.storeAction === 'expand') { finishSlide(); action.setAttribute('aria-pressed', String(root.classList.toggle('is-expanded'))); }
  });
  search.addEventListener('input', () => { finishSlide(); renderList(); content.scrollTop = 0; });
  root.addEventListener('keydown', event => { if (event.key === 'Escape' && activeProject) back(); });
  document.querySelector('[data-projects-open]').addEventListener('click', () => { root.classList.remove('is-closed'); search.focus(); });
  renderList();
})();
