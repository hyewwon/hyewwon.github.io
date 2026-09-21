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
      links: [{ label: '공식 사이트 보기', url: 'https://kbam.co.kr/' }],
      role: '백엔드 설계·개발 · 인증·개인정보 · CMS · 배포', period: '2026.01–2026.08',
      tags: ['Python', 'Django', 'Celery', 'Redis', 'OAuth 0.2', 'AES/HMAC', 'Docker', 'AWS',],
      summary: 'KB 자산운용·RISE ETF 통합 웹사이트의 회원 인증·CMS·금융상품 API 개발 및 폐쇄망 인프라 배포',
      // Optional editorial schema: reusable across projects without changing legacy details.
      editorial: {
        subtitle: '회원 인증부터 금융상품·콘텐츠 API, 운영 CMS까지 연결한 통합 백엔드 개발',
        intro: 'KB 자산운용·RISE ETF 웹사이트의 공통 백엔드·CMS 통합.\n회원 인증·개인정보 처리 구조 설계 및 금융상품·콘텐츠 API, 운영 기능 개발과 QA·폐쇄망 배포 참여',
        cases: [
          {
            id: 'privacy', label: '회원 · 개인정보', title: '회원가입·인증 아키텍처 설계 및 보안성 심의 대응',
            preview: '일반·소셜 회원가입과 PASS 인증 흐름, 개인정보 저장 시점 및 암호화 구조 설계·구현',
            need: '일반 가입과 카카오·네이버 소셜 가입의 인증·동의 절차 차이. PASS 본인인증과 각 가입 흐름을 연결하고, 보안성 심의 요구에 맞춘 개인정보 저장 시점·보관 구조 설계 필요',
            implementation: [
              '일반·소셜 회원가입과 PASS 본인인증을 연결하는 처리 흐름 및 인증·가입 DB 구조를 설계 및 구현',
              '일반 가입은 PASS 인증 결과를 임시 캐시에 보관한 뒤 필수 동의 검증·가입 완료 시 회원 DB에 저장하고, 소셜 가입은 소셜 동의 절차 이후 저장하도록 경로 구분',
              '개인정보와 CI 저장 모델을 분리하고, 암호화 처리를 커스텀 모델 필드로 공통화',
              'KB 보안성 심의 요구사항 반영 및 통과'
            ],
          },
          {
            id: 'performance', label: '조회 성능', title: '상품 시계열 데이터 캐싱 최적화',
            preview: 'Redis 캐시 적용으로 일별 누적 상품 데이터의 조회 부담 완화',
            need: '서비스 DB와 분리된 상품 DB에서 매일 적재되는 시계열 데이터 조회 필요. 많은 누적 데이터와 목록·상세 화면의 가격·수익률 등 공통 지표 반복 조회로 응답 지연 발생',
            implementation: ['가격·기간별 수익률 등 자주 조회하는 성과 요약 데이터를 Redis에 캐시해 재사용하도록 개선', '캐시 데이터 재사용 및 캐시에 없는 상품만 DB에서 조회·보충하여 원본 데이터 조회 부담 완화', '일별 적재 완료를 확인한 데이터 버전으로 캐시 갱신, 캐시 조회 실패 시 DB 조회로 대체하도록 구성'],
          },
          {
            id: 'recommendation', label: '개인화 추천', title: '행동을 관심사로, 관심사를 추천으로',
            preview: '검색·조회 행동 점수화 및 관심 키워드 기반 금융상품·콘텐츠 추천 구현',
            need: '사용자의 탐색 행동을 상품·콘텐츠 추천에 활용하고, 로그인 이후에도 비회원 관심 이력을 유지할 수 있는 처리 필요',
            implementation: ['검색·조회에 서로 다른 가중치를 부여하고, 동일 행동의 반복 반영을 날짜 단위로 제한', '상위 관심 키워드와 상품·콘텐츠의 키워드 일치 수를 기준으로 추천 대상을 선정', '관심 점수를 주기적으로 감쇠하고, 로그인 시 비회원·회원 점수를 합산해 관심 이력을 연결', '관심 점수 적재와 비회원 이력 병합을 Celery 작업으로 분리'],
          }
        ],
        groups: [
          { title: '회원·보안', summary: '회원 인증·개인정보 처리 및 공통 API 기반 구현', contributions: [0, 1, 2] },
          { title: '상품·콘텐츠', summary: '금융상품·콘텐츠 API, CMS 및 마이페이지 기능 연동', contributions: [3, 4, 5] },
          { title: '운영·배포', summary: '운영 이슈 대응 및 QA·폐쇄망 배포 참여', contributions: [6, 7, 8] }
        ]
      },
      description: 'KB 자산운용과 RISE ETF 웹사이트를 공통 백엔드·CMS로 통합하는 프로젝트입니다. 기존 데이터와 운영 기능을 분석하고, 회원 인증·개인정보 처리·외부 본인인증 연동을 설계했습니다. 콘텐츠·금융상품·마이페이지 API와 관리자 기능을 개발하고, QA와 폐쇄망 배포 작업에도 참여했습니다.',
      contributions: [
        '기존 두 사이트의 테이블·CMS 분석 및 ERD·데이터 모델 정리. 이전 대상·유지 기능 검토, 공통 예외 응답·페이지네이션·Swagger 스키마 헬퍼 및 API 문서 작성 방식 구성',
        '회원가입·로그인·로그아웃·탈퇴 및 JWT 발급·갱신·검증 구현. 소셜 로그인·계정 연동·해제, PASS 본인인증 요청·콜백 처리 개발 및 아이디 찾기·비밀번호 초기화·동의 이력 연동',
        '개인정보 필드의 AES-256-GCM 암호화 및 HMAC 검색용 해시 적용. 탈퇴·재가입 정책, 로그인 요청 제한·관리자 권한 반영 및 본인인증 연동용 암복호화 클라이언트 모듈 개발',
        '공지·공시·뉴스·배너·인사이트·투자 가이드 모델·공개 API·관리 화면 구현. 메뉴별 운영 권한, 배너·푸터·이벤트 관리 및 콘텐츠 AI 생성 API 연동',
        '투자 참고 지표·상품 문서·판매사·판매 상품 API 개발. ETF 계산·비교, 재투자 수익률 차트, 투자성향 적합도 요약 및 관련 관리자 기능 구현',
        '관심 상품·콘텐츠 북마크, 최근 본 콘텐츠·읽기 진행률·활동 포인트 및 계산·비교 저장 API 개발. 비회원 식별자 처리, 사용자 추천 및 상품 랭킹·테마·인기 검색어 조회 기능 추가',
        '고객 문의 CAPTCHA 검증·개인정보 암호화·답변·메일 발송 연동. 로그인·동의 변경·콘텐츠 조회·메일 발송 이력, 관리자 통계 및 외부 콘텐츠 적재·재실행 기능 구현',
        'S3 직접 선업로드 및 임시파일 관리 개선. 소셜 신규가입 직후 DB 복제 지연 문제와 이메일 재발송 등 운영 이슈 대응',
        '인증 흐름 검증용 데모·API 가이드 작성 및 QA 피드백 반영. 프록시 서버 설정·배포, 개인정보 관련 DB 권한 분리 및 폐쇄망 배포 참여'
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
      period: '2025.03–2025.12',
      tags: ['Python', 'Django', 'Celery', 'Redis', 'Docker Compose', 'ComfyUI', 'Ollama'],
      summary: '삼성 디자인 R&D 센터 사내 AI 이미지 생성 서비스의 운영 CMS 개발 및 배포 지원',
      editorial: {
        subtitle: '사용자 인증·팀 권한부터 생성 콘텐츠·이용 현황까지 연결한 AI 서비스 운영 CMS 구축',
        intro: '삼성 디자인 R&D 센터 디자이너 대상 사내 AI 이미지 생성 서비스\n사용자 인증·팀 권한·콘텐츠·이용 현황을 관리하는 CMS 개발 및 이미지 생성 API·비동기 처리 개발 참여',
        cases: [
          {
            id: 'authentication', label: '인증 · 권한', title: '사용자 인증·팀 권한 기반 CMS 구축',
            preview: '사용자·팀 모델과 JWT 인증 설계, 관리자 등급·소속 팀에 따른 계정 관리 범위 구현',
            need: 'AI 서비스의 사용자와 팀을 관리하고, 관리자 등급·소속 팀에 따라 계정 생성 및 조회 범위를 구분하는 운영 기능 필요',
            implementation: [
              '사용자·팀 테이블 및 로그인·토큰 발급·갱신·검증 흐름 설계',
              '계정 모델에 맞춘 JWT 인증 처리 구성',
              '관리자 등급·소속 팀에 따른 계정 생성·조회 범위 구분',
              '계정 권한 수정·비밀번호 초기화 및 팀 관리 API 구현'
            ]
          },
          {
            id: 'bulk-accounts', label: '계정 일괄 처리', title: 'CSV 기반 계정 일괄 등록',
            preview: 'CSV 검증과 일괄 생성 처리로 다수 사용자 등록을 파일 단위로 처리',
            need: '다수 사용자 계정을 파일 단위로 등록하고, CSV 인코딩·필수 컬럼·중복 ID 등 입력 데이터 검증 필요',
            implementation: [
              'CSV 인코딩 탐지 및 필수 컬럼·파일 내 중복 ID 검증',
              '트랜잭션과 일괄 생성 처리를 통한 계정 등록 구현'
            ]
          },
          {
            id: 'content-usage', label: '콘텐츠 · 이용 현황', title: '생성 콘텐츠·이용 현황 관리',
            preview: '프리셋·예제 프롬프트 관리와 팀·사용자별 생성 건수 조회를 CMS에 연결',
            need: '운영자가 생성용 콘텐츠를 관리하고, 팀·사용자별 이미지 생성 현황을 기간별로 확인할 수 있는 관리 화면 필요',
            implementation: [
              '프리셋 이미지 등록·조회·순서 변경·삭제 및 예제 프롬프트 관리 구현',
              '팀·사용자별 일별·최근 7일·최근 30일·전체 이미지 생성 건수 집계',
              '업로드 이미지를 제외한 생성 건수 기준 적용',
              '화면의 조회·렌더링 흐름을 고려한 API 응답 구성 및 Fetch 연동'
            ]
          }
        ],
        groups: [
          { title: '이미지 생성 연동', summary: '이미지 생성 관련 API·비동기 처리 개발 참여', contributions: [0, 1] },
          { title: 'CMS 화면 연동', summary: '데이터 조회·폼 전송·응답 처리 및 운영 화면 개선', contributions: [2] },
          { title: 'QA·배포 지원', summary: 'QA 대응 및 배포 과정 팔로우업', contributions: [3] }
        ]
      },
      description: '삼성 디자인 R&D 센터에서 사용하는 AI 이미지·텍스트 생성 서비스입니다. PlusX의 삼성 컨설팅 프로젝트로 참여해, 사용자가 이미지를 생성하고 이력을 관리하는 API와 관리자가 사용자·팀·콘텐츠를 운영하는 CMS를 개발했습니다. 초기 인증·CMS 구축부터 2·3차 운영 기능 고도화와 배포 지원까지 담당했습니다.',
      contributions: [
        '선임 개발자들과 이미지 생성 관련 API 개발 참여 및 생성 작업 연동 지원',
        '이미지 생성 서비스의 비동기 처리 개발 참여 및 선임 개발자의 생성 작업 팔로우업',
        'Fetch 기반 데이터 조회·폼 전송·응답 처리 구현. 화면의 조회·렌더링 흐름과 팀원 요구사항을 고려한 응답 구조 정리 및 운영 화면 개선',
        'QA 피드백 대응 및 배포 과정 팔로우업'
      ],
      problem: '이미지 생성 기능뿐 아니라 사용자·팀별 권한, 콘텐츠 관리, 사용 내역 확인까지 운영자가 처리할 수 있어야 했습니다. 2·3차에서는 생성 로그 기반 통계와 함께 비정상 종료된 생성 작업을 정리할 관리 기능도 필요했습니다.',
      solution: '인증과 역할별 권한을 API·CMS에 함께 적용하고, 프론트엔드의 조회·렌더링 흐름에 맞춰 응답 구조를 정리했습니다. 생성 로그를 기준으로 팀·유저 통계를 조회하도록 수정하고, 이용 내역 다운로드와 생성 오류 초기화 기능을 CMS에 연결했습니다.',
      result: '관리자가 CMS에서 사용자·팀·콘텐츠를 관리하고 생성 통계와 이용 내역을 내려받을 수 있도록 구현했습니다. 오류 초기화 기능과 배포 후 QA까지 작업하며, 개별 API 구현을 넘어 실제 운영 과정에 필요한 기능을 연결하는 경험을 쌓았습니다.'
    },
    // Evidence: works' weekly project log, May–September 2026. Do not publish internal budget amounts.
    {
      id: 'developers-station', name: 'PlusX Developers · Station', icon: 'DS', brand: 'plusx', category: 'plusx', company: 'PlusX',
      role: '백엔드 설계·개발 · AWS 인프라 자동화 · 서비스 연동',
      period: '2026.08–2026.09',
      links: [{ label: 'PlusX 브런치', url: 'https://brunch.co.kr/@plusx/148' }],
      tags: ['AWS Lightsail', 'Route 53', 'S3', 'CloudFront', 'IAM', 'Celery', 'PostgreSQL', 'AWS Cost Explorer', 'AWS Budgets'],
      summary: 'AWS 인프라 생성 자동화, 승인·SSO·Station 연동 및 비용 조회 API 개발, S3·CloudFront 연동',
      editorial: {
        subtitle: '개발 환경 신청·발급부터 사내 서비스 게시·공유까지 연결한 플랫폼 구축',
        intro: '임직원의 개발 환경 신청·발급을 지원하는 Developers와 제작한 서비스를 사내에서 공유하는 Station 구축. 파트 리드·CTO와 공동 기획하고, 두 서비스의 백엔드 아키텍처 전체 설계 및 개발 담당. 개발자 중심의 AWS 직접 관리와 개별 서비스 운영을 전 임직원이 이용 가능한 플랫폼으로 전환',
        cases: [
          {
            id: 'infrastructure', label: 'Developers · 인프라', title: '승인 기반 개발 환경 발급 자동화',
            preview: '인스턴스·DB·SSO 신청과 승인·활성화를 연결한 개발 환경 제공 기능 구현',
            need: '개발자가 AWS에서 직접 관리하던 환경을 임직원이 신청·발급받을 수 있는 절차로 전환 필요',
            implementation: [
              '인스턴스·DB·SSO 신청 및 승인·상태 관리 설계',
              'Lightsail 인스턴스·관계형 DB 생성, 키 발급 및 Route 53 도메인 설정 구현',
              '승인 후 사용자 활성화 및 Celery 기반 비동기 자원 발급 처리',
            ]
          },
          {
            id: 'publishing', label: 'Station · 서비스 공유', title: '사내 서비스 게시·버전 관리 플랫폼 구축',
            preview: 'Developers의 릴리즈 신청과 Station 게시를 연결하고 버전·반응·파일 제공 기능 구현',
            need: '개별적으로 만들어져 공유되지 않던 서비스를 사내에서 탐색·활용할 수 있는 공간 마련',
            implementation: [
              '프로젝트·버전·릴리즈 데이터 모델 및 게시 관리 API 설계',
              '릴리즈 신청·승인과 Station 게시·수정·미노출 처리 연동',
              '프로젝트 목록·상세·릴리즈 노트·사용자 반응 기능 구현',
              '이미지·첨부파일의 S3 저장 및 CloudFront 제공으로 웹 서버의 파일 전송 부담 분리',
              'CloudFront 서명 URL을 통한 비공개 파일 접근 제어'
            ]
          },
          {
            id: 'costs', label: '비용 · 예산', title: '프로젝트별 AWS 비용 추적·예산 조회',
            preview: '자원별 비용 추적 태그와 AWS 비용 API를 연동해 프로젝트 지출 및 월간 예산 현황 조회 구현',
            need: '발급한 자원의 비용을 프로젝트별로 구분하고 지출·예산 현황을 확인하는 기능 필요',
            implementation: [
              '생성 자원에 프로젝트별 비용 추적 태그 적용',
              'Cost Explorer 기반 프로젝트별·월별 비용 조회',
              '전월 대비·기간별 추이·서비스별 비용 내역 제공',
              'AWS Budgets의 월간 예산 잔액·사용률 연동',
            ]
          }
        ],
        groups: [
          { title: '인프라 운영', summary: '자원 시작·중지·삭제 및 스냅샷 기반 환경 구성', contributions: [0] },
          { title: 'Station 운영·연동', summary: '게시·배너·권한 관리 및 서비스 간 동기화', contributions: [1, 2, 3] },
          { title: '인증·배포', summary: '그룹웨어 SSO 연동, 환경 설정 및 테스트', contributions: [4] }
        ]
      },
      description: '사내 프로젝트의 인프라 신청·승인·운영을 관리하는 Developers와, 프로젝트를 소개하고 버전별 릴리즈를 관리하는 Station을 연결한 서비스입니다. Developers에서는 서버·데이터베이스·SSO 신청과 비용 조회를, Station에서는 프로젝트 공개·릴리즈 노트·사용자 반응을 다룹니다. 인프라 생성 아키텍처 설계부터 두 서비스의 API 연동과 운영 화면 구현까지 참여했습니다.',
      contributions: [
        '인스턴스 시작·중지·재실행 및 스냅샷 기반 생성 구현. 삭제 승인 시 인스턴스·DNS·키 페어 정리, PostgreSQL 설치 스냅샷 기반 구성 및 DB 신청·삭제 API 구현',
        '관리자 승인·반려, 자원 삭제 결재 및 Station 최초 릴리즈·수정·미노출의 2단계 승인 구현. 카테고리·접근 권한 그룹 관리와 화면 연동',
        '게시 여부·순서 및 히어로 배너 관리, S3 이미지 업로드·교체·정리 구현. 후속 버전 생성·삭제·릴리즈 노트 수정 및 Developers에서 Station 반응 집계 조회 연동',
        'Developers 승인 이후 Celery를 통한 Station API 호출 및 버전·릴리즈 노트 비동기 동기화. 최초 릴리즈 버전 삭제 제한 및 Bearer Token 인증 적용',
        '그룹웨어 SSO 로그인·토큰 발급·삭제 및 삭제 결재·이력 처리 연동. 스테이징·Developers 프로덕션 환경 설정, 이미지 접근·반응 API 테스트 추가'
      ],
      problem: '프로젝트 서버를 생성하는 기능만으로는 신청·승인·중지·삭제와 비용 확인까지 관리하기 어려웠습니다. Developers의 승인 내역을 Station의 실제 게시 상태에 연결하면서, 릴리즈 정보와 이미지 접근 방식도 두 서비스에서 일관되게 처리할 필요가 있었습니다.',
      solution: '인프라의 생성부터 삭제까지 결재 상태에 맞춰 처리하고, 승인된 릴리즈 변경은 Celery 기반으로 Station에 전달했습니다. 노출 순서와 반응 데이터는 Station을 기준으로 관리하도록 정리했으며, 비공개 S3 파일은 CloudFront Signed URL로 조회했습니다. 운영 비용은 AWS 조회 API와 리소스 태그를 통해 화면에 연결했습니다.',
      result: '인프라 신청·승인·운영에서 프로젝트 릴리즈와 비용 조회까지 이어지는 관리 기능을 구현했습니다. Developers와 Station의 역할을 구분하면서 승인 결과와 게시 정보를 연동했고, 정적 목데이터로 구성된 화면을 실제 API 기반 운영 화면으로 전환했습니다.'
    },
    // Remaining PlusX details: works' weekly log and project self-review notes.
    // Preserve approved list summaries; include only documented work in each case study.
    {
      "id": "groupware",
      "name": "PlusX 그룹웨어",
      "icon": "GW",
      "brand": "plusx",
      "category": "plusx",
      "company": "PlusX",
      "role": "백엔드 API · 관리자 기능 개선 · 운영·CS 대응",
      "period": "2024.09–2026.07",
      "tags": [
        "Python",
        "Slack API",
        "SSO",
        "Nginx",
        "Gunicorn"
      ],
      "summary": "사내 근태·휴가·전자결재 API 개발 및 스케줄러·Slack 알림·SSO 연동",
      "description": "운영 중인 사내 그룹웨어의 근태·휴가·전자결재 및 관리자 기능 개선. Slack 업무·운영 알림 모듈 구축과 캘린더 조회·마이페이지 API 개선, 변경된 사내 정책 반영 및 운영 대응",
      "contributions": [
        "자율출퇴근·유연근무·근속 연차 정책에 맞춘 출퇴근 검증, 인정 근무 시간 및 결근·알림 스케줄러 수정",
        "월별 근태 통계·일일 출퇴근·조직 정보 조회·수정, 회사·팀·직급 관리 및 CSV 다운로드 구현",
        "사내 서비스용 SSO 토큰 발급·삭제 및 프로필 정보 반환 구현",
        "전자결재·근태 데이터 이슈 분석과 보정 스크립트 작성, 근태·투입 리소스 추출 및 대량 조회 설정 조정"
      ],
      "editorial": {
        "intro": "운영 중인 사내 그룹웨어의 근태·휴가·전자결재 및 관리자 기능 개선. Slack 업무·운영 알림 모듈 구축과 캘린더 조회·마이페이지 API 개선, 변경된 사내 정책 반영 및 운영 대응",
        "cases": [
          {
            "id": "slack",
            "label": "업무 · 운영 알림",
            "title": "활동 기록 조회를 Slack 이벤트 알림으로 확장",
            "preview": "재사용 가능한 Slack 알림 모듈로 업무 이벤트와 운영 오류 전달",
            "need": "웹에서 확인하던 활동 기록을 사내 Slack 도입에 맞춰 업무·운영 알림으로 전달할 수 있는 경로 필요",
            "implementation": [
              "결재·휴가·연차 등 업무 이벤트를 Slack 봇 알림으로 연결하고 출퇴근 안내 추가",
              "메시지 템플릿과 입력 데이터를 분리해 다른 개발자가 여러 기능에 적용할 수 있는 알림 모듈 구성",
              "Webhook 기반 채널 알림과 운영 오류·스케줄러 실행 결과 전송 구현",
              "동료의 알림 기능 요청 반영 및 공통 모듈 제공으로 후속 Slack 연동 개발 지원"
            ]
          },
          {
            "id": "calendar",
            "label": "조회 · 화면 연동",
            "title": "캘린더 조회 개선 및 마이페이지 API 분리",
            "preview": "조회 쿼리 개선과 월간 요약·일자별 상세 분리로 초기 조회 부담 완화",
            "need": "캘린더 초기 화면 표시 지연 및 Django 템플릿에 결합된 마이페이지 데이터 처리 개선 필요",
            "implementation": [
              "캘린더 조회 쿼리 개선 및 월간 요약·일자별 상세 조회 API 분리",
              "마이페이지 데이터 처리를 API로 분리하고 프로필·근무 현황·휴가·계정 화면 연동",
              "화면 마크업·스크립트 검토 및 팀원 피드백 반영",
              "비동기 요청의 세션 만료 대응 추가"
            ]
          }
        ],
        "groups": [
          {
            "title": "근태·조직 관리",
            "summary": "근무제·휴가 정책과 관리자 기능 개선",
            "contributions": [
              0,
              1
            ]
          },
          {
            "title": "사내 연동·운영",
            "summary": "SSO 연동과 데이터 이슈 대응",
            "contributions": [
              2,
              3
            ]
          }
        ]
      }
    },
    {
      "id": "cgv",
      "name": "CGV 프로모션 웹사이트",
      "icon": "CGV",
      "brand": "cgv",
      "category": "plusx",
      "company": "PlusX · CGV",
      "role": "백엔드 API 개발 · 환경 구축",
      "period": "2024.10",
      "tags": [
        "AWS",
        "S3",
        "REST API"
      ],
      "summary": "프로모션 이벤트의 이미지 생성·조회 API 개발 및 AWS S3·DB 연동과 배포 환경 구축",
      "description": "CGV 프로모션 웹사이트의 이미지 생성·조회 기능을 위한 백엔드 개발. 초기 환경 구성과 API·S3·데이터베이스 연동 및 스테이징 배포 수행",
      "contributions": [],
      "editorial": {
        "intro": "CGV 프로모션 웹사이트의 이미지 생성·조회 기능을 위한 백엔드 개발. 초기 환경 구성과 API·S3·데이터베이스 연동 및 스테이징 배포 수행",
        "cases": [
          {
            "id": "image-api",
            "label": "이미지 · API",
            "title": "프로모션 이미지 기능의 백엔드 구축",
            "preview": "이미지 생성·조회 API와 저장소·DB를 연결한 이벤트 기능 구현",
            "need": "프로모션 웹사이트에서 이미지 기능을 사용할 수 있도록 API·저장소·데이터베이스를 연결할 필요",
            "implementation": [
              "프로젝트 초기 개발 환경 설정",
              "프로모션 이미지 생성·조회 API 개발",
              "AWS S3 및 데이터베이스 연동"
            ]
          },
          {
            "id": "staging",
            "label": "환경 · 배포",
            "title": "스테이징 환경 구성 및 코드 정리",
            "preview": "API를 확인할 수 있는 스테이징 배포 환경 구축",
            "need": "구현한 이미지 기능을 배포 환경에서 확인하고 후속 개발에 사용할 기반 필요",
            "implementation": [
              "스테이징 배포 환경 설정",
              "프로젝트 코드 리팩토링"
            ]
          }
        ],
        "groups": []
      }
    },
    {
      "id": "deeponde",
      "name": "디폰데 이벤트 Deeponde",
      "icon": "D",
      "brand": "deeponde",
      "category": "plusx",
      "company": "PlusX · Deeponde",
      "role": "게임 API · 인증·접근 제어 · 배포·QA",
      "period": "2025.03",
      "tags": [
        "REST API",
        "Middleware",
        "인증·접근 제어"
      ],
      "summary": "이벤트 게임 API 및 인증·비정상 요청 차단 로직 개발, 배포·QA 대응",
      "description": "디폰데 프로모션 이벤트 게임 백엔드 개발. 게임 진행·종료 API, 인증·접근 제어 및 테스트용 API 구현과 배포·QA 수행",
      "contributions": [],
      "editorial": {
        "intro": "디폰데 프로모션 이벤트 게임 백엔드 개발. 게임 진행·종료 API, 인증·접근 제어 및 테스트용 API 구현과 배포·QA 수행",
        "cases": [
          {
            "id": "access",
            "label": "게임 · 인증",
            "title": "게임 흐름 기반 인증·비정상 요청 제어",
            "preview": "게임 순서를 벗어난 API 호출과 반복 상품 수령 요청을 제한하는 처리 구현",
            "need": "URL 직접 호출과 게임 단계 우회, 상품 수령 API 반복 요청 등 정상 참여 흐름을 벗어난 접근 제어 필요",
            "implementation": [
              "게임 진행·종료 API 및 참여 흐름에 맞춘 인증 로직 설계",
              "반복 상품 수령 등 비정상 호출을 제어하는 미들웨어 구현",
              "허용 도메인·클라이언트 검증 적용"
            ]
          },
          {
            "id": "qa",
            "label": "응답 · 검증",
            "title": "API 응답 정리 및 배포·QA 대응",
            "preview": "상황별 오류 응답 문서화와 테스트용 API를 통한 연동 검증",
            "need": "프론트엔드가 실패 상황을 구분하고 이벤트 진행 흐름을 검증할 수 있는 응답·테스트 기반 필요",
            "implementation": [
              "테스트용 API 개발 및 전체 API 테스트·리팩토링",
              "오류 형식·상황별 응답 코드 정리 및 문서화",
              "스테이징 테스트, 프로덕션 배포·DB 업데이트 및 QA 피드백 대응"
            ]
          }
        ],
        "groups": []
      }
    },
    {
      "id": "another",
      "name": "Another Class",
      "icon": "A",
      "brand": "plusx",
      "category": "plusx",
      "company": "PlusX",
      "role": "서비스 기획 참여 · 프론트엔드·백엔드 개발 · 배포",
      "period": "2025.06.16–2025.12.31",
      "tags": [
        "SSE",
        "Redis Pub/Sub",
        "Celery",
        "ASGI",
        "Webhook",
        "OpenAI Transcription API"
      ],
      "summary": "보이스 클로닝·TTS 웹 도구 R&D 및 SSE 기반 문장별 결과 전달 구현",
      "description": "회사 PR·강의 서비스 활용을 목표로 보이스 클로닝과 TTS를 연결한 영상 제작 웹 도구 R&D. AI 프롬프트 엔지니어와 2인 협업으로 화면 공동 설계, 프론트엔드·백엔드 및 배포 환경 구성 담당",
      "contributions": [
        "OpenAI Transcription API 연동 Task, 예외 응답·API 문서 정리 및 배포·테스트 수행",
        "구현한 이벤트 전달 방식을 견적서 사이트의 채팅 메시지 수신에 활용하는 방안을 CTO에게 제안"
      ],
      "editorial": {
        "intro": "회사 PR·강의 서비스 활용을 목표로 보이스 클로닝과 TTS를 연결한 영상 제작 웹 도구 R&D. AI 프롬프트 엔지니어와 2인 협업으로 화면 공동 설계, 프론트엔드·백엔드 및 배포 환경 구성 담당",
        "cases": [
          {
            "id": "events",
            "label": "실시간 결과 전달",
            "title": "SSE 기반 문장별 음성 결과 수신",
            "preview": "SSE·Redis Pub/Sub로 여러 문장의 음성 처리 결과를 개별 전달하는 프로토타입 개발",
            "need": "짧은 시간에 여러 문장의 처리 결과가 발생하는 TTS 특성에 맞는 결과 전달 방식 필요",
            "implementation": [
              "기존 이미지 서비스의 Polling 경험과 TTS 요구를 비교해 SSE 방식 선정",
              "프로젝트별 Redis 채널·문단 식별자를 구성해 문장별 결과 이벤트 연결",
              "Webhook·음성 저장·전사 등 후처리 결과를 클라이언트 이벤트로 전달",
              "ASGI·Celery 실행 환경 구성"
            ]
          },
          {
            "id": "voice-editor",
            "label": "음성 · 웹 개발",
            "title": "음성 생성과 프로젝트·스크립트 편집 연결",
            "preview": "보이스 클로닝·TTS API와 문단 편집·상태 표시 화면 통합",
            "need": "음성 생성 요청부터 문장별 결과 확인까지 이어지는 웹 사용 흐름 필요",
            "implementation": [
              "선정된 TTS·클로닝 모델을 비동기 API·Task·Webhook으로 연동",
              "보이스·프로젝트·스크립트 데이터 구조 및 생성·조회·수정·삭제 API 구현",
              "문단 편집·음성 재생 및 입력·대기·결과 상태 화면 개발",
              "AI 프롬프트 엔지니어와 화면 공동 설계"
            ]
          }
        ],
        "groups": [
          {
            "title": "운영 기반·기술 공유",
            "summary": "API 문서·배포 구성 및 이벤트 전달 방식 활용 검토",
            "contributions": [
              0,
              1
            ]
          }
        ]
      }
    },
    {
      "id": "tuniverse",
      "name": "T Universe Figma Plugin",
      "links": [{ "label": "PlusX 브런치", "url": "https://brunch.co.kr/@plusx/137" }],
      "icon": "T",
      "brand": "figma",
      "category": "plusx",
      "company": "PlusX",
      "role": "AI 서비스 레이어 · 모델 파이프라인 · 인증·사용량 관리",
      "period": "2025.09.25–2025.12.31",
      "tags": [
        "Replicate",
        "ComfyUI",
        "Ollama",
        "FAL",
        "Redis",
        "Celery",
        "Webhook",
        "HMAC"
      ],
      "summary": "T 우주 운영용 아이콘 생성을 위한 AI 텍스트·이미지 생성 플러그인의 모델 연동 API 및 비동기 처리 개발",
      "description": "T우주 운영자의 브랜드 스타일 3D 아이콘 제작을 지원하는 Figma 플러그인 백엔드 개발. AI 프롬프트 엔지니어의 모델·워크플로우와 프론트엔드의 플러그인을 연결하는 API·실행 흐름·상태 관리 설계 및 배포 담당",
      "contributions": [
        "배경 제거·업스케일·회전·이미지 설명·3D 생성 등 모델 연동 API 개발",
        "프록시·Celery Beat 실행 환경 구성, 업로드 이미지 정리 및 업스케일 전 투명 배경 병합 개선"
      ],
      "editorial": {
        "intro": "T우주 운영자의 브랜드 스타일 3D 아이콘 제작을 지원하는 Figma 플러그인 백엔드 개발. AI 프롬프트 엔지니어의 모델·워크플로우와 프론트엔드의 플러그인을 연결하는 API·실행 흐름·상태 관리 설계 및 배포 담당",
        "cases": [
          {
            "id": "pipeline",
            "label": "모델 · 파이프라인",
            "title": "다단계 AI 실행 백엔드 구축",
            "preview": "모델 호출·Webhook 수신·후속 실행을 연결한 아이콘 제작 흐름 구현",
            "need": "모델마다 다른 입력 옵션과 단계별 결과를 연결해 플러그인에서 활용할 수 있는 실행 구조 필요",
            "implementation": [
              "Replicate·ComfyUI 및 사내 GPU의 Ollama 호출을 백엔드 API로 연동",
              "모델 설정·입력 옵션 객체 분리 및 단계별 입출력 매핑 공통화",
              "Webhook 결과 수신과 후속 모델 실행 흐름 구현",
              "AI 프롬프트 엔지니어의 모델·워크플로우와 Figma 프론트엔드 연계"
            ]
          },
          {
            "id": "state",
            "label": "비동기 · 상태",
            "title": "실행 상태·결과 검증 및 타임아웃 처리",
            "preview": "작업 ID·현재 단계·진행 상태를 관리하고 완료·실패 상태 제공",
            "need": "실행 시간이 다른 다단계 작업의 진행 상황과 실패 여부를 클라이언트에 전달할 필요",
            "implementation": [
              "Redis 캐시에 작업 ID·단계·진행 상태와 중간 데이터 관리",
              "모델 출력 검증 및 상태 조회 시 타임아웃 처리",
              "Celery 기반 Ollama 비동기 호출 및 결과 확인 API 구현"
            ]
          },
          {
            "id": "usage",
            "label": "인증 · 사용량",
            "title": "회원·체험 사용자 이용 정책 구현",
            "preview": "비회원 체험 제한과 회원 사용량 관리, 운영 인원 대상 플러그인 제공",
            "need": "비로그인 체험과 회원 사용을 구분하고 비정상 요청·사용량을 제어할 필요",
            "implementation": [
              "계정·트라이얼 인증 및 체험 횟수·회원 사용량 관리",
              "HMAC·Nonce 검증과 클라이언트 검증·요청 제한 적용",
              "사용 내역·사용량 초기화 및 관리자 기능 구현",
              "백엔드 배포와 API 문서화·QA 수행"
            ]
          }
        ],
        "groups": [
          {
            "title": "이미지 처리·운영 개선",
            "summary": "모델 실행 기능 확장과 운영 피드백 반영",
            "contributions": [
              0,
              1
            ]
          }
        ]
      }
    },
    {
      "id": "genai",
      "name": "PlusX GenAI",
      "icon": "G",
      "brand": "plusx",
      "category": "plusx",
      "company": "PlusX",
      "role": "데이터 설계 · 서비스 API · 인증·운영 기능",
      "period": "2025.08–2025.11",
      "tags": [
        "SSO",
        "REST API",
        "Slack API"
      ],
      "summary": "사내 AI 이미지 생성 플랫폼의 데이터 구조 설계, 서비스 API 개발 및 SSO 연동",
      "description": "사내 AI 이미지 생성·탐색 플랫폼의 초기 데이터 구조와 서비스 API 개발. 그룹웨어 SSO, 이미지 활용 기능과 서비스 상태·오류 알림 관리 구현",
      "contributions": [],
      "editorial": {
        "intro": "사내 AI 이미지 생성·탐색 플랫폼의 초기 데이터 구조와 서비스 API 개발. 그룹웨어 SSO, 이미지 활용 기능과 서비스 상태·오류 알림 관리 구현",
        "cases": [
          {
            "id": "library",
            "label": "인증 · 라이브러리",
            "title": "SSO와 이미지 탐색·활용 API 구축",
            "preview": "사내 인증부터 이미지 검색·다운로드·북마크까지 연결",
            "need": "구성원이 사내 계정으로 접속해 생성 이미지를 탐색·활용할 수 있는 데이터·API 기반 필요",
            "implementation": [
              "프로젝트 환경 설정 및 테이블·ERD 설계",
              "그룹웨어 SSO 연동 및 인증 API 문서화",
              "테마·기능·팀 목록, 랜덤 이미지 및 라이브러리 목록·프롬프트 필터링 API 개발",
              "이미지 다운로드·북마크 추가·삭제 구현"
            ]
          },
          {
            "id": "operations",
            "label": "운영 · 상태 제어",
            "title": "서비스 중단 상태와 오류 알림 관리",
            "preview": "서비스 상태를 생성 요청에 반영하고 서버 오류를 Slack으로 전달",
            "need": "운영 중 서비스 중단 여부를 생성 과정에 적용하고 오류를 확인할 수 있는 관리 기능 필요",
            "implementation": [
              "서비스 중단 상태·시스템 로그 테이블 및 관리 화면 구성",
              "중단 상태의 캐시 반영과 이미지 생성 과정의 상태 확인 구현",
              "클라이언트용 서비스 상태 조회 API 추가",
              "예외 핸들러 및 Slack 서버 오류 알림 모듈 개발"
            ]
          }
        ],
        "groups": []
      }
    },
    {
      "id": "awards",
      "name": "PlusX Awards",
      "icon": "A",
      "brand": "plusx",
      "category": "plusx",
      "company": "PlusX",
      "role": "CMS 개발 · 접근 권한·SSO · 문서 출력",
      "period": "2026.04–2026.05",
      "tags": [
        "CMS",
        "SSO",
        "PDF"
      ],
      "summary": "사내 어워즈 출품작 관리 CMS 개발, SSO 연동 및 세금계산서 PDF 추출 기능 구현",
      "description": "사내 어워즈 출품작을 등록·관리하는 CMS 개발. 그룹웨어 SSO·접근 권한과 출품작 탐색·관련 PDF 출력 연결 및 운영 피드백 반영",
      "contributions": [],
      "editorial": {
        "intro": "사내 어워즈 출품작을 등록·관리하는 CMS 개발. 그룹웨어 SSO·접근 권한과 출품작 탐색·관련 PDF 출력 연결 및 운영 피드백 반영",
        "cases": [
          {
            "id": "cms",
            "label": "출품작 · CMS",
            "title": "사내 인증 기반 출품작 관리 구축",
            "preview": "SSO·접근 권한과 출품작 등록·목록 탐색을 CMS에 통합",
            "need": "사내 사용자 권한에 맞춰 출품작 정보를 등록하고 연도별로 관리할 수 있는 도구 필요",
            "implementation": [
              "초기 프로젝트·CMS 및 배포 환경 구성",
              "그룹웨어 SSO 연동과 사용자 접근 권한 테이블·관리 페이지 구현",
              "출품작 등록 폼·목록 필터링 개선",
              "운영 피드백에 따른 연도별 화면 재구성 및 Dropbox 링크 입력 추가"
            ]
          },
          {
            "id": "documents",
            "label": "문서 · 운영 개선",
            "title": "출품 관련 PDF 출력 및 관리 기능 정리",
            "preview": "세금계산서 PDF 추출과 게시 사이트 분리에 따른 CMS 정리",
            "need": "출품 관련 서류 출력과 분리된 게시 사이트에 맞춘 관리 범위 정리 필요",
            "implementation": [
              "출품작 관련 세금계산서 PDF 추출 기능 개발",
              "문서 출력 후속 수정 사항 반영",
              "게시 사이트 분리에 맞춘 Awards 메뉴·코드 정리"
            ]
          }
        ],
        "groups": []
      }
    },
    // GNC source: works/지엔씨솔루션 프로젝트.pages. Existing dates and Envisager
    // authentication history are cross-checked against feature/1's about_modal.html.
    // Omit improvement percentages without measurement details.
    {
      "id": "emax",
      "name": "EMAX",
      "icon": "E",
      "brand": "emax",
      "category": "gnc",
      "company": "GNC Solution",
      "role": "웹 풀스택 · DB 설계 · 예측 모듈 연동",
      "tags": [
        "Python",
        "Django",
        "JavaScript",
        "MariaDB",
        "Pandas",
        "django-apscheduler"
      ],
      "summary": "전력 소비량 예측 웹·DB 신규 개발 및 자동 예측 관리 구현, 고객사 납품·검수 완료",
      "image": "assets/image/work_project/emax.png",
      "description": "장비 전력 데이터를 이용한 AI 학습·예측 및 자동 실행 관리 웹 시스템 신규 개발. 웹 풀스택·DB 설계를 단독 수행하고 AI 담당자가 제공한 모델·모듈 연동. 소스코드 전달을 통한 고객사 납품·검수 완료",
      "contributions": [],
      "period": "2023.11–2024.01",
      "editorial": {
        "intro": "장비 전력 데이터를 이용한 AI 학습·예측 및 자동 실행 관리 웹 시스템 신규 개발. 웹 풀스택·DB 설계를 단독 수행하고 AI 담당자가 제공한 모델·모듈 연동. 소스코드 전달을 통한 고객사 납품·검수 완료",
        "cases": [
          {
            "id": "prediction",
            "label": "데이터 · 예측 연동",
            "title": "AI 학습·예측 관리 웹 시스템 신규 구축",
            "preview": "장비·모델·예측 이력 관리와 학습·예측 모듈의 웹 기능 연동",
            "need": "AI 담당자가 제공한 학습·예측 기능을 관리자가 웹에서 설정하고 결과를 확인할 수 있는 사용 흐름 필요",
            "implementation": [
              "장비·알고리즘·학습 모델·예측 이력 DB 및 웹 화면 설계·개발",
              "LSTM·Prophet 모듈 연동 및 학습 파라미터 전달·모델 파일 저장·결과 처리 공통화",
              "시간·일·월 단위 예측 결과와 실행 이력 저장·조회·시각화 구현"
            ]
          },
          {
            "id": "scheduler",
            "label": "자동 실행",
            "title": "웹 설정 기반 예측 스케줄 관리",
            "preview": "APScheduler 공통 모듈과 자동 예측 주기·대상 모델 설정 연결",
            "need": "관리 화면에서 예측 주기와 가동 여부·대상 모델을 설정할 수 있는 자동 실행 기능 필요",
            "implementation": [
              "APScheduler 기반 작업 등록·변경·제거 공통 모듈 구성",
              "웹의 자동 예측 주기·가동 여부·대상 모델 설정을 스케줄러에 연동",
              "학습·예측 처리 모듈과 자동 실행 관리 기능 연결"
            ]
          }
        ],
        "groups": []
      }
    },
    {
      "id": "performance",
      "name": "Build Performance",
      "icon": "B",
      "brand": "buildpay",
      "category": "gnc",
      "company": "GNC Solution · 빌드텍",
      "role": "GraphQL 앱 API · 관리자 웹 · 비동기 작업",
      "period": "2023.08–2023.10",
      "tags": [
        "Python",
        "Django",
        "JavaScript",
        "GraphQL",
        "MariaDB",
        "Celery",
        "Celery Beat",
        "Gunicorn",
        "Nginx"
      ],
      "summary": "BuildPay 연동 채굴기 관리 앱의 GraphQL API 및 주기적 보상 처리 개발",
      "image": "assets/image/work_project/build_performance.png",
      "description": "BuildPay와 연동하는 채굴기 관리 서비스의 GraphQL API·관리자 웹 개발. DB 프로시저 기반 주기적 보상을 Celery·Beat로 전환하고 정책 관리·오류 추적 기능을 실제 운영에 적용",
      "contributions": [
        "앱 프론트엔드와 협업한 GraphQL API·MariaDB 작업 및 Django·JavaScript 관리자 웹 개발",
        "처음 도입한 Celery·Celery Beat의 배포 방법 조사 및 주기 작업 운영 구성 파악"
      ],
      "editorial": {
        "intro": "BuildPay와 연동하는 채굴기 관리 서비스의 GraphQL API·관리자 웹 개발. DB 프로시저 기반 주기적 보상을 Celery·Beat로 전환하고 정책 관리·오류 추적 기능을 실제 운영에 적용",
        "cases": [
          {
            "id": "rewards",
            "label": "보상 · 주기 작업",
            "title": "DB 프로시저 보상을 Celery·Beat로 전환",
            "preview": "보상 계산 로직과 주기 실행을 애플리케이션 작업으로 분리",
            "need": "DB 프로시저 기반 보상의 오류 추적·유지보수 및 관리자 화면에서의 정책 제어 어려움",
            "implementation": [
              "Celery 작업과 Beat 스케줄 기반 처리 방식 선정",
              "등급별 비율·활성 채굴기 수를 반영한 10분 주기 보상 계산 구현",
              "전월 적립액 기반 월별 추천인 보상 분배 로직 구현"
            ]
          },
          {
            "id": "tracking",
            "label": "관리 · 추적",
            "title": "보상 정책 설정과 지급·오류 이력 연결",
            "preview": "관리자 설정을 보상 계산에 반영하고 실행·오류 원인 확인 경로 구축",
            "need": "보상 정책 변경과 지급 내역·오류 원인을 애플리케이션에서 확인할 수 있는 관리 기능 필요",
            "implementation": [
              "관리자 등급·분배 정책 설정과 보상 계산 연동",
              "채굴기·그룹·추천인 및 보상 내역 관리 기능 개발",
              "보상 원장·분배 이력과 실행·오류 로그 기록"
            ]
          }
        ],
        "groups": [
          {
            "title": "앱 API·운영 구성",
            "summary": "GraphQL 연동 및 비동기 작업 배포 방식 검토",
            "contributions": [
              0,
              1
            ]
          }
        ]
      }
    },
    {
      "id": "envisager",
      "name": "Envisager",
      "icon": "EN",
      "brand": "envisager",
      "category": "gnc",
      "company": "GNC Solution",
      "role": "웹 풀스택 · 웹 API · JWT 인증",
      "period": "2023.06–2023.11",
      "tags": [
        "Python",
        "Django",
        "JavaScript",
        "DRF",
        "SimpleJWT",
        "MariaDB",
        "Gunicorn",
        "Nginx"
      ],
      "summary": "예술 플랫폼 웹사이트 신규 개발 및 작가 신청·승인·작품 운영·JWT 인증 구현",
      "image": "assets/image/work_project/envisager.png",
      "description": "작가 신청·승인과 예술단체·컬렉션·작품 운영을 제공하는 예술 플랫폼 웹사이트 신규 개발. 개발자 2인 협업으로 전반적인 웹 기능과 데이터 관리 구현 및 실제 운영에 기여",
      "contributions": [],
      "editorial": {
        "intro": "작가 신청·승인과 예술단체·컬렉션·작품 운영을 제공하는 예술 플랫폼 웹사이트 신규 개발. 개발자 2인 협업으로 전반적인 웹 기능과 데이터 관리 구현 및 실제 운영에 기여",
        "cases": [
          {
            "id": "jwt",
            "label": "웹 · 인증",
            "title": "신규 웹 플랫폼에 JWT 인증 도입",
            "preview": "토큰 발급·갱신·로그아웃 및 웹 사용자 인증 흐름 구성",
            "need": "기존 Django 세션 로그인 사용 경험을 바탕으로 신규 플랫폼의 웹 API에 적용할 토큰 인증 흐름 필요",
            "implementation": [
              "DRF·SimpleJWT 기반 JWT 인증 도입",
              "토큰 발급·갱신·로그아웃 및 사용자 인증 처리 구성",
              "Django·JavaScript 사용자 화면과 웹 API 연동"
            ]
          },
          {
            "id": "artists",
            "label": "작가 · 작품 운영",
            "title": "작가 등록과 작품 탐색 기능 연결",
            "preview": "작가 신청·승인, 단체·컬렉션 관리 및 작품 조회 구현",
            "need": "작가 등록부터 단체 소속 관리와 작품 탐색까지 이어지는 사용자·관리자 기능 필요",
            "implementation": [
              "예술단체·컬렉션 관리와 작가 신청·승인 개발",
              "작품 목록·상세·주제별 조회 API 구현",
              "작품 상세 페이지로 연결하는 QR 이미지 생성",
              "협업 개발자와 웹사이트 전반의 사용자·관리자 기능 개발"
            ]
          }
        ],
        "groups": []
      }
    },
    {
      "id": "buildpay",
      "name": "BuildPay",
      "icon": "B",
      "brand": "buildpay",
      "category": "gnc",
      "company": "GNC Solution · 빌드텍",
      "role": "GraphQL 앱 API · 쇼핑몰 REST API · 관리자 웹",
      "period": "",
      "tags": [
        "Python",
        "Django",
        "JavaScript",
        "GraphQL",
        "REST API",
        "MariaDB",
        "Pandas",
        "Gunicorn",
        "Nginx"
      ],
      "summary": "전자지갑·쇼핑몰 연동 서비스 리뉴얼 및 관리자 출력 공통화·가입·스탬프 기능 개선",
      "image": "assets/image/work_project/buildpay.png",
      "description": "가상자산 지갑·포인트 전환·Build Mall 연동 서비스의 리뉴얼 및 유지보수. 선임 개발자 2명과 API·관리자 기능을 분담하고, 엑셀 출력 공통화·스탬프·이메일 인증 및 운영·배포 수행",
      "contributions": [
        "GraphQL 앱 API·Build Mall REST API·관리자 웹 개발 및 유지보수",
        "포인트 전환 한도·이체 상태·거래 내역 관리 기능 개선",
        "선임 개발자 2명과 리뉴얼·유지보수 분담 및 서비스 운영·서버 배포 수행"
      ],
      "editorial": {
        "intro": "가상자산 지갑·포인트 전환·Build Mall 연동 서비스의 리뉴얼 및 유지보수. 선임 개발자 2명과 API·관리자 기능을 분담하고, 엑셀 출력 공통화·스탬프·이메일 인증 및 운영·배포 수행",
        "cases": [
          {
            "id": "excel",
            "label": "관리자 · 공통화",
            "title": "엑셀 다운로드 공통 모듈 구축",
            "preview": "화면별 출력 기능을 분리해 동료 개발자가 여러 관리 기능에서 재사용",
            "need": "관리 화면마다 반복 구현하던 엑셀 다운로드의 파일 생성·응답 처리를 공통화할 필요",
            "implementation": [
              "Pandas·ExcelWriter 기반 데이터 목록 엑셀 출력 구현",
              "데이터·컬럼 설정과 파일 생성·응답 처리를 분리해 모듈화",
              "회원·거래·포인트 등 관리 기능에서 동료 개발자가 재사용하도록 제공"
            ]
          },
          {
            "id": "stamp",
            "label": "리워드 · 이력",
            "title": "추천 가입 스탬프·쿠폰 기능 구현",
            "preview": "가입자·추천인 적립과 누적 스탬프 기반 쿠폰 발급·이력 연결",
            "need": "추천 가입 관계에 따른 스탬프 적립과 누적 수량 기반 쿠폰 관리 기능 필요",
            "implementation": [
              "추천 가입자·추천인의 스탬프 적립 설계·구현",
              "누적 수량에 따른 쿠폰 발급 및 이력 관리 구현"
            ]
          },
          {
            "id": "email",
            "label": "가입 · 인증",
            "title": "이메일 인증 기반 계정 활성화 연결",
            "preview": "가입 흐름에 이메일 인증을 추가하고 인증 완료 후 계정 활성화 연동",
            "need": "무분별한 가입·이용에 대응하기 위한 가입자 이메일 확인 절차 필요",
            "implementation": [
              "가입 흐름에 이메일 인증 추가",
              "인증 메일 발송·토큰 확인과 계정 활성화 흐름 연동"
            ]
          }
        ],
        "groups": [
          {
            "title": "서비스 리뉴얼·운영",
            "summary": "앱·쇼핑몰 API 및 관리자 기능 개선",
            "contributions": [
              0,
              1,
              2
            ]
          }
        ]
      }
    },
    {
      "id": "enjo",
      "name": "Enjo-Eat",
      "icon": "EE",
      "brand": "enjo",
      "logo": "assets/image/personal_project/enjo-eat-icon.png",
      "category": "personal",
      "company": "개인 프로젝트",
      "role": "기획 · 디자인 · 개발",
      "period": "2022.09.20–2022.10.16",
      "tags": [
        "Django",
        "JavaScript",
        "Selenium",
        "MariaDB",
        "Kakao Map API"
      ],
      "summary": "음식점과 메뉴를 쉽고 즐겁게 고르는 서비스",
      "image": "assets/image/enjo_eat/main2.png",
      "github": "https://github.com/hyewwon/Enjo_eat",
      "description": "음식점과 메뉴 선택의 고민에서 시작한 개인 웹 프로젝트. 지역·목적별 음식점 그룹과 공유 기능을 기획하고 Django 기반 웹과 외부 지도·이미지 기능 구현",
      "contributions": [],
      "editorial": {
        "intro": "음식점과 메뉴 선택의 고민에서 시작한 개인 웹 프로젝트. 지역·목적별 음식점 그룹과 공유 기능을 기획하고 Django 기반 웹과 외부 지도·이미지 기능 구현",
        "cases": [
          {
            "id": "restaurants",
            "label": "기획 · 웹 개발",
            "title": "음식점 탐색·선택 서비스 구현",
            "preview": "음식점 그룹과 선택·공유 기능을 하나의 웹 서비스로 구성",
            "need": "지역이나 목적에 맞는 음식점을 모으고 다른 사용자와 공유하며 선택할 수 있는 기능 필요",
            "implementation": [
              "서비스 기획·디자인 및 Django·JavaScript 웹 개발",
              "음식점 그룹과 선택·공유 기능 구성"
            ]
          },
          {
            "id": "registration",
            "label": "외부 서비스 연동",
            "title": "지도·이미지 기반 음식점 등록 지원",
            "preview": "Kakao Map과 이미지 검색을 음식점 입력 과정에 연결",
            "need": "음식점 이름·위치·이미지를 등록하는 과정의 편의 개선 필요",
            "implementation": [
              "Kakao Map API로 음식점 위치·이름 입력 지원",
              "Selenium 기반 이미지 검색·등록 기능 구현"
            ]
          }
        ],
        "groups": []
      }
    },
    {
      "id": "finalsay",
      "name": "FinalSay",
      "icon": "F",
      "brand": "finalsay",
      "category": "personal",
      "company": "개인 프로젝트",
      "role": "백엔드 API · AI 연동 · 배포 구성",
      "logo": "assets/image/personal_project/finalsay-icon.png",
      "tags": [
        "Python",
        "Django",
        "DRF",
        "PostgreSQL",
        "OpenAI",
        "Celery",
        "Redis",
        "Firebase",
        "Docker",
        "Gunicorn",
        "Nginx"
      ],
      "summary": "찬반 토론과 투표를 모아 AI가 결과와 근거를 정리하는 앱",
      "description": "찬반 주장·투표·공감을 모아 AI가 토론 결과와 근거를 정리하는 개인 프로젝트. Flutter 앱과 연결되는 Django 백엔드의 회원·토론·투표 API, AI 처리·알림·광고 보상 및 배포 구성 개발",
      "contributions": [
        "주제·주장·공감·투표·신고·판결 모델 및 카테고리·국가별 목록·참여 이력·검색 API 개발",
        "Docker Compose 기반 Django·Gunicorn·Celery Worker·Beat·Redis·Nginx 구성 및 HTTPS·배포·상태 점검 스크립트 정리"
      ],
      "editorial": {
        "intro": "찬반 주장·투표·공감을 모아 AI가 토론 결과와 근거를 정리하는 개인 프로젝트. Flutter 앱과 연결되는 Django 백엔드의 회원·토론·투표 API, AI 처리·알림·광고 보상 및 배포 구성 개발",
        "cases": [
          {
            "id": "verdict",
            "label": "AI · 비동기 처리",
            "title": "토론 종료 후 AI 결과 생성·검증",
            "preview": "만료된 토론의 주장으로 결과를 생성하고 응답 검증 후 저장",
            "need": "토론 참여 이후 AI 결과 생성·조회까지 연결하고 반복 작업의 중복 저장을 제어할 필요",
            "implementation": [
              "Celery 작업으로 만료된 토론의 주장을 OpenAI에 전달",
              "응답 JSON의 필수 값·자료형 검증 후 판결 요약·근거 저장",
              "주제별 판결 관계와 트랜잭션으로 중복 저장 제어"
            ]
          },
          {
            "id": "rewards",
            "label": "인증 · 보상",
            "title": "외부 인증과 광고 보상 검증",
            "preview": "소셜 토큰·광고 보상 서명 검증과 거래 ID 기반 중복 확인",
            "need": "앱 로그인과 투표권 보상에서 외부 요청의 유효성 및 반복 요청 확인 필요",
            "implementation": [
              "Google·Apple 인증 토큰 검증과 SimpleJWT 앱 로그인 연결",
              "AdMob SSV 서명 검증 및 거래 ID 기반 중복 보상 확인",
              "검증 결과를 투표권 지급에 연결"
            ]
          },
          {
            "id": "notifications",
            "label": "시간대 · 알림",
            "title": "국가별 주기 작업과 결과 알림 연결",
            "preview": "시간대별 투표권 초기화 및 AI 결과 완료 알림 구현",
            "need": "사용자 국가별 시간대와 토론 결과 완료에 맞춘 주기 처리·알림 필요",
            "implementation": [
              "Celery 기반 국가별 시간대 기준 투표권 초기화",
              "판결 완료 후 참여자에게 Firebase Cloud Messaging 알림 전달"
            ]
          }
        ],
        "groups": [
          {
            "title": "토론 API·배포",
            "summary": "회원·토론 데이터와 컨테이너 실행 환경 구성",
            "contributions": [
              0,
              1
            ]
          }
        ]
      }
    },
    // Team features are verified against the linked repositories, not individual
    // ownership claims. Only README-confirmed development dates are displayed.
    {
      "id": "opd",
      "name": "Our Project Diary",
      "icon": "OPD",
      "brand": "opd",
      "category": "team",
      "company": "팀 프로젝트",
      "role": "팀 개발",
      "tags": [
        "Python",
        "Django",
        "JavaScript",
        "Bootstrap"
      ],
      "github": "https://github.com/hyewwon/OPD_Project2",
      "summary": "개발 프로젝트 기록과 팀원 모집을 연결하는 Our Project Diary",
      "description": "프로젝트 기록·개발 자료·팀원 모집을 연결한 Django 기반 팀 프로젝트. 아래 내용은 개인 단독 기여가 아닌 팀 프로젝트의 구현 범위",
      "contributions": [],
      "editorial": {
        "intro": "프로젝트 기록·개발 자료·팀원 모집을 연결한 Django 기반 팀 프로젝트. 아래 내용은 개인 단독 기여가 아닌 팀 프로젝트의 구현 범위",
        "cases": [
          {
            "id": "projects",
            "label": "프로젝트 · 자료",
            "title": "프로젝트 기록과 문서 공유",
            "preview": "프로젝트 검색·공개 설정 및 자료 업로드·다운로드 구현",
            "need": "프로젝트 소개와 개발 자료를 한곳에서 탐색·관리할 수 있는 공간 필요",
            "implementation": [
              "프로젝트 생성·수정·삭제 및 공개 여부 설정",
              "제목·내용·참여자·기술별 검색과 페이지네이션 구현",
              "썸네일·문서 업로드 및 원본 파일명 기반 다운로드 제공"
            ]
          },
          {
            "id": "recruitment",
            "label": "모집 · 커뮤니티",
            "title": "프로젝트와 팀원 모집 연결",
            "preview": "개발자·기업 프로필과 기술·인원별 모집 및 댓글 연결",
            "need": "프로젝트 정보 탐색 이후 팀원 모집·소통까지 이어지는 기능 필요",
            "implementation": [
              "프로젝트·모집 정보 및 필요 기술·인원 관리",
              "개발자·기업 프로필과 관심 프로젝트 구성",
              "댓글·답글 기반 프로젝트 소통 기능 연결"
            ]
          }
        ],
        "groups": []
      }
    },
    {
      "id": "mango",
      "name": "MANGO",
      "icon": "M",
      "brand": "mango",
      "category": "team",
      "company": "팀 프로젝트",
      "role": "팀 개발",
      "logo": "assets/image/team_project/mango-logo.png",
      "image": "assets/image/team_project/mango-features.png",
      "imageCaption": "저장소의 음악·챗봇 기능 안내",
      "tags": [
        "Python",
        "Django",
        "TensorFlow",
        "Keras",
        "Pandas",
        "BeautifulSoup",
        "JavaScript"
      ],
      "github": "https://github.com/hyewwon/MANGO",
      "summary": "대화 속 감정·날씨·취향을 분석해 음악을 추천하는 챗봇 서비스",
      "description": "음악 탐색과 대화 기반 추천을 결합한 팀 프로젝트. Django 웹·Python 챗봇 서버를 연결하고 감정·날씨·가사 분위기에 따른 음악 탐색 구성. 아래 내용은 팀 프로젝트의 구현 범위",
      "contributions": [],
      "editorial": {
        "intro": "음악 탐색과 대화 기반 추천을 결합한 팀 프로젝트. Django 웹·Python 챗봇 서버를 연결하고 감정·날씨·가사 분위기에 따른 음악 탐색 구성. 아래 내용은 팀 프로젝트의 구현 범위",
        "cases": [
          {
            "id": "conversation",
            "label": "대화 · 추천",
            "title": "일상 표현을 음악 추천으로 연결",
            "preview": "의도·감정·날씨·취향 분석을 결합한 챗봇 응답 구성",
            "need": "곡명 입력뿐 아니라 기분·날씨 등 일상적인 표현으로 음악을 찾는 기능 필요",
            "implementation": [
              "의도 분류·개체명 인식 및 감정·날씨 분석 모델 연결",
              "플레이리스트 가사 분위기 분석 기반 취향 추천 구성",
              "소켓 기반 Python 서버에서 분석·추천 결과를 JSON으로 반환"
            ]
          },
          {
            "id": "search",
            "label": "데이터 · 웹 연동",
            "title": "음악 정보 탐색과 챗봇 결과 표시",
            "preview": "수집한 곡·앨범·아티스트 정보와 추천 응답을 웹 화면에 연결",
            "need": "음악 탐색 데이터와 대화 분석 결과를 브라우저에서 함께 제공할 필요",
            "implementation": [
              "BeautifulSoup 기반 차트·곡·앨범·아티스트 정보 수집",
              "Django 화면·검색 응답과 음악 데이터 연결",
              "분류 보완을 위한 입력 문장·라벨 저장 기능 구성"
            ]
          }
        ],
        "groups": []
      }
    },
    {
      "id": "akbocado",
      "name": "Akbocado",
      "icon": "A",
      "brand": "akbocado",
      "category": "team",
      "company": "팀 프로젝트",
      "role": "팀 개발",
      "logo": "assets/image/team_project/akbocado-logo.png",
      "image": "assets/image/team_project/akbocado-logo.png",
      "imageCaption": "원본 프로젝트 로고",
      "tags": [
        "Python",
        "Django",
        "OpenCV",
        "TensorFlow",
        "NumPy",
        "OCR",
        "JavaScript"
      ],
      "github": "https://github.com/hyewwon/Akbocado",
      "summary": "악보 이미지에서 곡 정보와 음표를 인식하는 OCR 웹 서비스",
      "description": "악보 이미지의 곡 정보·가사·음표를 분석하고 관련 곡 검색을 연결한 OCR 웹 팀 프로젝트. 아래 내용은 개인 단독 기여가 아닌 팀 프로젝트의 구현 범위",
      "contributions": [],
      "editorial": {
        "intro": "악보 이미지의 곡 정보·가사·음표를 분석하고 관련 곡 검색을 연결한 OCR 웹 팀 프로젝트. 아래 내용은 개인 단독 기여가 아닌 팀 프로젝트의 구현 범위",
        "cases": [
          {
            "id": "recognition",
            "label": "이미지 · 인식",
            "title": "악보 전처리와 OCR·음표 분석 연결",
            "preview": "이미지에서 곡 정보 및 음의 높이·박자 추출",
            "need": "이미지로 존재하는 악보의 텍스트·음표를 분석 가능한 데이터로 변환할 필요",
            "implementation": [
              "OpenCV 기반 노이즈·오선 제거, 정규화 및 객체 검출·인식",
              "제목·작사·작곡·가사 영역의 OCR 결과를 유형별 JSON으로 전달",
              "음의 높이·박자 정보 추출"
            ]
          },
          {
            "id": "web",
            "label": "업로드 · 웹",
            "title": "업로드부터 분석 결과·곡 검색까지 연결",
            "preview": "이미지 유형 확인과 처리 상태·결과 표시 구현",
            "need": "사용자가 브라우저에서 악보를 업로드하고 분석 결과를 확인할 수 있는 흐름 필요",
            "implementation": [
              "드래그 앤 드롭·미리보기·분석 중 화면 구성",
              "Ajax 기반 입력 이미지 유형 확인",
              "분석 결과 표시 및 제목·아티스트 기반 음악 검색 연결"
            ]
          }
        ],
        "groups": []
      }
    },
    {
      "id": "reshop",
      "name": "Reshop",
      "icon": "R",
      "brand": "reshop",
      "category": "team",
      "company": "팀 프로젝트",
      "role": "팀 개발",
      "logo": "assets/image/team_project/reshop-logo.png",
      "image": "assets/image/team_project/reshop-logo.png",
      "imageCaption": "원본 프로젝트 로고",
      "tags": [
        "Java",
        "JSP",
        "Servlet",
        "MyBatis",
        "JavaScript",
        "jQuery"
      ],
      "github": "https://github.com/hyewwon/Reshop",
      "summary": "중고·업사이클링 상품과 기부 소식을 다루는 쇼핑몰",
      "description": "중고·업사이클링 상품 구매와 기부 소식을 제공하는 Java·JSP 쇼핑몰 팀 프로젝트. 아래 내용은 팀 프로젝트의 사용자·관리자 기능 구현 범위",
      "contributions": [],
      "editorial": {
        "intro": "중고·업사이클링 상품 구매와 기부 소식을 제공하는 Java·JSP 쇼핑몰 팀 프로젝트. 아래 내용은 팀 프로젝트의 사용자·관리자 기능 구현 범위",
        "cases": [
          {
            "id": "orders",
            "label": "상품 · 주문",
            "title": "상품 탐색부터 주문 저장까지 연결",
            "preview": "회원·장바구니·배송 정보와 주문 처리 구성",
            "need": "상품 탐색·구매와 재사용·나눔 정보를 함께 제공하는 쇼핑몰 기능 필요",
            "implementation": [
              "회원가입·로그인·프로필 수정 및 계정 관리 구성",
              "상품 탐색·장바구니·배송 정보 입력·주문 저장 연결",
              "주문 후 장바구니 정리 처리"
            ]
          },
          {
            "id": "management",
            "label": "관리자 · 게시판",
            "title": "쇼핑몰 운영과 커뮤니티 기능 구현",
            "preview": "상품·주문·회원 관리 및 게시글·댓글·첨부파일 연결",
            "need": "사용자 거래 흐름을 지원하는 관리자 기능과 공지·문의·기부 소식 관리 필요",
            "implementation": [
              "상품·주문·회원 관리 페이지 및 서버 처리 구현",
              "공지·문의·기부 게시판에 댓글·첨부파일 연결",
              "Servlet 요청 처리와 MyBatis 데이터 접근 분리"
            ]
          }
        ],
        "groups": []
      }
    },
    {
      "id": "twith",
      "name": "Twith",
      "icon": "T",
      "brand": "twith",
      "category": "team",
      "company": "팀 프로젝트",
      "role": "팀 개발",
      "period": "2021.09.08–2021.10.07",
      "logo": "assets/image/team_project/twith-logo.png",
      "image": "assets/image/team_project/twith-logo.png",
      "imageCaption": "원본 프로젝트 로고",
      "tags": [
        "Java",
        "Spring Framework",
        "MyBatis",
        "Oracle",
        "JavaScript",
        "jQuery",
        "Kakao Map API"
      ],
      "github": "https://github.com/hyewwon/Twith",
      "summary": "테마별 여행 모임을 모집하고 함께 여행할 사람을 찾는 커뮤니티",
      "description": "테마별 여행 모임 모집과 여행자 커뮤니티를 연결한 Spring Framework 팀 프로젝트. 아래 내용은 팀 프로젝트의 모집·참여·소통 기능 구현 범위",
      "contributions": [],
      "editorial": {
        "intro": "테마별 여행 모임 모집과 여행자 커뮤니티를 연결한 Spring Framework 팀 프로젝트. 아래 내용은 팀 프로젝트의 모집·참여·소통 기능 구현 범위",
        "cases": [
          {
            "id": "participation",
            "label": "모임 · 참여",
            "title": "여행 모임 모집·신청·승인 구현",
            "preview": "테마별 모집 게시글과 모임장의 참여자 관리 연결",
            "need": "여행 동행 탐색 이후 모집·신청·참여자 관리까지 이어지는 과정 필요",
            "implementation": [
              "모임 생성·수정, 테마별 모집 게시글 및 상세·페이지네이션 구성",
              "참여 신청과 모임장 승인·거절, 참여자 조회·관리 연결",
              "Spring MVC·MyBatis·Oracle 기반 회원·모임·게시글 데이터 관리"
            ]
          },
          {
            "id": "community",
            "label": "지도 · 소통",
            "title": "모임 장소 안내와 여행 커뮤니티 연결",
            "preview": "지도·대화·댓글 및 여행 정보 게시판 구성",
            "need": "모임 참여자가 장소를 확인하고 모집 이후에도 소통할 수 있는 공간 필요",
            "implementation": [
              "Kakao Map API 기반 모임 장소 안내",
              "모임 대화·댓글 및 여행 정보 게시판 제공"
            ]
          }
        ],
        "groups": []
      }
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
  const featuredIds = ['kb', 'samsung-ai', 'developers-station', 'tuniverse'];
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
  function renderEditorial(p) {
    const { intro, cases, groups } = p.editorial;
    return `<section class="store-detail__section"><h3>프로젝트 소개</h3><p>${escape(intro).replace(/\r\n|\r|\n/g, '<br>')}</p></section>
      <section class="store-detail__section"><h3>${p.category === 'team' ? '주요 기능 미리보기' : '핵심 기여 미리보기'}</h3>
        <div class="store-preview-track">${cases.map((item, index) => `<button type="button" class="store-preview-card" data-case-target="${escape(item.id)}">
          <span class="store-preview-card__label">${String(index + 1).padStart(2, '0')} · ${escape(item.label)}</span>
          <strong>${escape(item.title)}</strong><span class="store-preview-card__description">${escape(item.preview)}</span>
          <span class="store-preview-card__link">구현 이야기 보기 ↗</span>
        </button>`).join('')}</div>
      </section>
      <section class="store-detail__section"><h3>${p.category === 'team' ? '팀 프로젝트의 주요 구현' : '주요 성과'}</h3>${cases.map(item => `<article class="store-implementation" data-case-id="${escape(item.id)}" tabindex="-1">
        <span class="store-preview-card__label">${escape(item.label)}</span><h4>${escape(item.title)}</h4>
        <dl><div><dt>필요했던 것</dt><dd>${escape(item.need)}</dd></div>
        <div><dt>구현 방식</dt><dd><ul>${item.implementation.map(text => `<li>${escape(text)}</li>`).join('')}</ul></dd></div>
        </dl>
        ${item.note ? `<p class="store-implementation__note">${escape(item.note)}</p>` : ''}</article>`).join('')}</section>
      ${groups.length ? `<section class="store-detail__section"><h3>${p.category === 'team' ? '추가 구현' : '그 밖에 맡은 일'}</h3>${groups.map(group => `<details class="store-work-group"><summary><span><strong>${escape(group.title)}</strong><span>${escape(group.summary)}</span></span></summary>
        <ul>${group.contributions.map(index => `<li>${escape(p.contributions[index])}</li>`).join('')}</ul></details>`).join('')}</section>` : ''}`;
  }
  function openProject(id) {
    const p = projects.find(p => p.id === id);
    if (!p || activeProject || slide) return;
    savedScroll = content.scrollTop;
    const snapshot = captureView();
    activeProject = id;
    discovery.hidden = true;
    detail.hidden = false;
    detail.classList.toggle('store-detail--editorial', Boolean(p.editorial));
    detail.innerHTML = `<button type="button" class="store-back" data-store-action="back">〈 프로젝트</button>
      <header class="store-detail__heading">${icon(p)}<div><h2 tabindex="-1">${escape(p.name)}</h2><p>${escape(p.editorial?.subtitle || p.summary)}</p>${p.github ? `<a class="store-external" href="${p.github}" target="_blank" rel="noopener noreferrer">GitHub 보기 ↗</a>` : ''}${(p.links || []).map(link => `<a class="store-external" href="${escape(link.url)}" target="_blank" rel="noopener noreferrer">${escape(link.label)} ↗</a>`).join('')}</div></header>
      <dl class="store-facts"><div><dt>소속 · 프로젝트</dt><dd>${escape(p.company)}</dd></div><div><dt>${p.category === 'team' ? '참여 형태' : '담당 역할'}</dt><dd>${escape(p.role)}</dd></div>${p.period ? `<div><dt>개발 기간</dt><dd>${escape(p.period)}</dd></div>` : ''}</dl>
      ${p.image ? `<figure class="store-screenshot"><img src="${p.image}" alt="${escape(p.name)} · ${escape(p.imageCaption || '서비스 화면')}"><figcaption>${escape(p.name)} · ${escape(p.imageCaption || '서비스 화면')}</figcaption></figure>` : ''}
      ${p.editorial ? renderEditorial(p) : `<section class="store-detail__section"><h3>프로젝트 소개</h3><p>${escape(p.description)}</p></section>
      <section class="store-detail__section"><h3>${p.category === 'team' ? '팀 프로젝트의 주요 구현' : '내가 맡은 일'}</h3><ul>${p.contributions.map(item => `<li>${escape(item)}</li>`).join('')}</ul></section>
      ${p.problem ? `<section class="store-case"><h3>개발 이야기</h3><div><h4>${p.category === 'team' ? '프로젝트 목표' : '해결할 문제'}</h4><p>${escape(p.problem)}</p></div><div><h4>설계와 구현</h4><p>${escape(p.solution)}</p></div><div><h4>${p.category === 'team' ? '구현 범위' : '적용 결과'}</h4><p>${escape(p.result)}</p></div></section>` : ''}`}
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
    const preview = event.target.closest('[data-case-target]');
    if (preview) {
      const target = [...detail.querySelectorAll('[data-case-id]')].find(item => item.dataset.caseId === preview.dataset.caseTarget);
      if (target) {
        target.focus({ preventScroll: true });
        content.scrollTo({ top: content.scrollTop + target.getBoundingClientRect().top - content.getBoundingClientRect().top - 20, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
      }
    }
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
