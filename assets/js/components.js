const SKILLS = {
    application: {
        label : "Application Layer",
        summary : "Python 기반으로 RESTful API, 인증 체계, 관리 도구를 설계하고 Django 생태계를 깊게 활용합니다.",
        items: [
            {
                img_url: "assets/image/skills_icon/python.png",
                name: "Python",
                note: "애플리케이션 핵심 로직과 자동화 스크립트 개발"
            },
            {
                img_url: "assets/image/skills_icon/django.png",
                name: "Django",
                note: "ORM 튜닝, Admin 확장, 멀티 앱 프로젝트 운영"
            },
            {
                img_url: "assets/image/skills_icon/drf.png",
                name: "Django REST framework",
                note: "버전 전략, 인증/권한 커스터마이징, API 문서 자동화"
            }
        ]
    },
    data: {
        label : "Data &amp; Cache",
        summary : "대규모 트랜잭션을 위해 정규화된 스키마와 캐시 전략을 병행하여 일관성과 속도를 확보합니다.",
        items: [
            {
                img_url: "assets/image/skills_icon/postgresql.png",
                name: "PostgreSQL",
                note: "PL/pgSQL 함수, 파티셔닝, 분석 쿼리 최적화"
            },
            {
                img_url: "assets/image/skills_icon/mariadb.png",
                name: "MariaDB",
                note: "슬로우 쿼리 모니터링 및 인덱스 전략 수립"
            },
            {
                img_url: "assets/image/skills_icon/redis.png",
                name: "Redis",
                note: "세션/락/큐 패턴 구성과 TTL 모니터링"
            }
        ]
    },
    platform: {
        label : "Platform &amp; Ops",
        summary : "운영 자동화와 배포 파이프라인을 구성해 반복 작업을 줄이고, 관측 가능한 환경을 만듭니다.",
        items: [
            {
                img_url: "assets/image/skills_icon/docker.png",
                name: "Docker",
                note: "멀티 스테이지 빌드와 운영/CI 환경 일원화"
            },
            {
                img_url: "assets/image/skills_icon/aws.png",
                name: "AWS",
                note: "EC2/RDS/ElastiCache 중심의 인프라 설계와 보안 가드레일"
            },
            {
                img_url: "assets/image/skills_icon/celery.png",
                name: "Celery",
                note: "비동기 태스크 큐 설계와 모니터링 파이프라인 구성"
            }
        ]
    },
    ai: {
        label : "AI Workflow",
        summary : "텍스트·이미지·멀티모달 모델을 서비스에 녹여내기 위해 파이프라인을 구성하고 프로토타입을 빠르게 검증합니다.",
        items: [
            {
                img_url: "assets/image/skills_icon/openai.png",
                name: "OpenAI",
                note: "GPT/밸류 모델을 이용한 텍스트 자동화·에이전트 시나리오 구현"
            },
            {
                img_url: "assets/image/skills_icon/fal.png",
                name: "Fal.ai",
                note: "서버리스 GPU 런으로 이미지 생성/변환 API 구축"
            },
            {
                img_url: "assets/image/skills_icon/replicate.png",
                name: "Replicate",
                note: "오픈 소스 모델을 REST API로 감싸 실험/배포"
            },
            {
                img_url: "assets/image/skills_icon/comfyui.png",
                name: "ComfyUI",
                note: "노드 그래프 기반 파이프라인 설계 및 커스텀 워크플로우 제작"
            },
        ]
    }
}