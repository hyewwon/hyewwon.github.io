# Frog character assets

캐릭터 이미지는 사용 위치와 제작 단계에 따라 구분합니다.

```text
character/
├─ splash/
│  └─ sprites/                 # 스플래시 진입 모션 최종 시트
├─ shared/
│  └─ swim/
│     ├─ sprites/              # 모든 콘텐츠에서 공통으로 사용하는 수영 시트
│     ├─ source/               # 편집 전 수영 원본
│     └─ frames/               # 수영 시트의 개별 프레임
└─ content/
   ├─ about/
   ├─ skills/
   │  ├─ common/
   │  │  ├─ sprites/          # Skills 공통 진입·대기 최종 시트
   │  │  ├─ source/           # 크로마키 제거 전 생성 원본
   │  │  └─ frames/           # enter/idle 동작별 8개 확인 프레임
   │  └─ backend-core/
   │     ├─ sprites/          # Backend Core 물고기 4종 통합 아틀라스
   │     ├─ source/           # 생성 원본
   │     └─ frames/           # 기술별 물고기 및 역할형 수중 생물 확인 프레임
   ├─ experience/
   └─ projects/
      ├─ sprites/              # 페이지에서 사용하는 최종 스프라이트 시트
      ├─ source/               # 생성 또는 편집 전 원본
      └─ frames/               # 확인·수정용 개별 프레임
```

콘텐츠 전용 최종 파일명은 아래 형식을 사용합니다.

- `frog-about-intro-wave-sheet.png` — About 진입 수영, 정면 전환, 인사 통합본
- `frog-about-wave-sheet.png` — 중앙 인사 루프만 사용하는 보조 시트
- `frog-skills-enter-sheet.png` — Skills 안내 위치로 수영해 들어와 정자세로 전환
- `frog-skills-idle-sheet.png` — 안내 위치에서 고정된 채 작게 부유하는 공통 루프
- `frog-skills-flow-swim-left-v3-sheet.png` — Skills 화면 오른쪽에서 진입한 뒤 왼쪽을 보며 상단 중앙에서 제자리 수영하는 8프레임 최종 보정본(프레임별 손발 안전 여백 적용)
- `backend-core-fish-swim-atlas-final.png` — Python, Django, DRF, Celery 물고기를 행별 4프레임으로 구성한 4×4 투명 스프라이트 아틀라스
- `backend-core-role-creatures-atlas-v1.png` — Python 장어, Django 상자복, REST API 요청·응답 물고기, Celery 작업 운반 새우를 행별 4프레임으로 구성한 역할형 4×4 투명 아틀라스
- `frog-experience-sheet.png`
- `frog-projects-sheet.png`

중간 생성본은 `source` 또는 `frames` 폴더에만 보관하고, 페이지에서는 각 `sprites` 폴더의 최종 시트만 참조합니다.
