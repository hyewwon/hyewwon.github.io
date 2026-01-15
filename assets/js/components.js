const SKILLS = {
    application: {
        label : "Application Layer",
        summary : "Python 기반으로 RESTful API, 인증 체계, 관리 도구를 설계하고 Django 생태계를 깊게 활용합니다.",
        items: [
            {
                img_url: "assets/image/skills_icon/python.png",
                name: "Python",
                note: "서비스 핵심 로직 구현 및 운영·자동화 스크립트 개발"
            },
            {
                img_url: "assets/image/skills_icon/django.png",
                name: "Django",
                note: "API 서버 구조 설계, Admin 커스터마이징 및 서비스 운영"
            },
            {
                img_url: "assets/image/skills_icon/drf.png",
                name: "Django REST framework",
                note: "REST API 설계, 인증·권한 로직 구현, Swagger 문서화"
            }
        ]
    },
    data: {
        label : "Data & Cache",
        summary : "서비스 특성에 맞춰 데이터 정합성과 조회 성능을 함께 고려한 저장소 구조를 설계했습니다.",
        items: [
            {
                img_url: "assets/image/skills_icon/postgresql.png",
                name: "PostgreSQL",
                note: "서비스 데이터 모델링 및 운영 환경에 맞춘 쿼리 튜닝"
            },
            {
                img_url: "assets/image/skills_icon/mariadb.png",
                name: "MariaDB",
                note: "인덱스 설계와 슬로우 쿼리 개선을 통한 조회 성능 관리"
            },
            {
                img_url: "assets/image/skills_icon/redis.png",
                name: "Redis",
                note: "캐시 및 임시 데이터 관리를 통한 응답 속도 개선"
            }
        ]
    },

    platform: {
        label : "Platform & Ops",
        summary : "운영 환경을 고려한 배포 구조를 구성해 안정적인 서비스 운영을 지원했습니다.",
        items: [
            {
                img_url: "assets/image/skills_icon/docker.png",
                name: "Docker",
                note: "개발·운영 환경을 고려한 컨테이너 구성 및 배포 환경 정리"
            },
            {
                img_url: "assets/image/skills_icon/aws.png",
                name: "AWS",
                note: "EC2 기반 서버 운영과 RDS·ElastiCache·S3·CloudFront 연계를 통한 서비스 인프라 구성"
            },
            {
                img_url: "assets/image/skills_icon/celery.png",
                name: "Celery",
                note: "비동기 작업 처리를 위한 태스크 구성 및 운영 환경 적용"
            }
        ]
    },

    ai: {
        label : "AI Workflow",
        summary : "서비스 요구사항에 맞춰 AI 모델을 연계하고, 빠른 검증을 위한 파이프라인을 구성했습니다.",
        items: [
            {
                img_url: "assets/image/skills_icon/openai.png",
                name: "OpenAI",
                note: "텍스트 생성·보정 기능 구현을 위한 API 연동 및 활용"
            },
            {
                img_url: "assets/image/skills_icon/fal.png",
                name: "Fal.ai",
                note: "이미지 생성·변환 기능을 위한 서버리스 API 연계"
            },
            {
                img_url: "assets/image/skills_icon/replicate.png",
                name: "Replicate",
                note: "외부 모델을 API로 연동해 기능 검증 및 서비스 적용"
            },
            {
                img_url: "assets/image/skills_icon/comfyui.png",
                name: "ComfyUI",
                note: "이미지 생성 워크플로우 구성 및 커스텀 파이프라인 설계"
            },
        ]
    }

}