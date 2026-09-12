# Hyewwon portfolio

macOS 스타일의 인터랙티브 백엔드 개발자 포트폴리오입니다.

## 로컬 실행

이 저장소 폴더에서 실행하세요. 상위 폴더에는 비공개 자료가 있으므로 서버를 열지 마세요.

```sh
npm ci
npm run check
npm run build
python3 -m http.server 8000 --bind 127.0.0.1 --directory dist
```

브라우저에서 http://127.0.0.1:8000/ 을 엽니다. 코드 수정 후에는 `npm run build`를 다시 실행합니다.
스타일을 실시간으로 수정하려면 `npm run dev:styles`를 사용하고 저장소 루트를 로컬 서버로 실행할 수 있습니다.

## 프로젝트 구조

- `index.html`: 스플래시, 잠금화면, 데스크톱의 메인 진입점
- `splash.html`: 이전 URL을 루트로 연결하는 호환용 리다이렉트
- `assets/js`, `assets/scss`, `assets/css`: 동작, 스타일 원본, 컴파일된 CSS
- `assets/image`: 현재 사용하는 이미지와 아이콘
- `assets/documents`: 경력 문서 HTML/CSS/JS와 썸네일
- `tools/site.mjs`: 정적 경로·동적 개구리 프레임 검사, 미사용 파일 보고, 배포 패키징
- `dist`: 자동 생성되는 배포 결과물. Git에는 포함하지 않습니다.

`npm run audit:assets`는 읽기 전용입니다. 파일을 자동 삭제하지 않습니다.
새 애니메이션의 동적 프레임 경로를 추가하면 `tools/site.mjs`의 `sequences`도 함께 갱신하세요.
배포 빌드는 참조된 파일만 복사하므로 작업 메모·SCSS·검사용 도구·출처 기록은 공개 결과물에 들어가지 않습니다.

## GitHub Pages 배포

1. GitHub 저장소의 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 설정합니다.
2. 완성한 변경을 검토한 뒤 `main` 브랜치에 반영하고 push합니다.
3. **Actions → Deploy GitHub Pages**에서 성공 여부를 확인합니다.
4. 공개 주소: https://hyewwon.github.io/

현재 개발 브랜치의 로컬 변경만으로는 배포되지 않습니다. 워크플로는 `main`의 push에서 배포하며, 수동 실행도 `main`에서만 게시됩니다.
브랜치 직접 게시 `/(root)` 방식 대신, 검증된 `dist`만 배포하도록 구성했습니다.
GitHub 환경 보호 규칙에 승인이나 허용 브랜치 설정이 있으면 해당 규칙을 따라야 합니다.

구성 참고: [GitHub Pages 사용자 지정 워크플로](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## 이미지 출처

앱 및 프로젝트 이미지 출처 기록은 `assets/image/desktop/dock/sources.json`,
`assets/image/team_project/sources.json`, `assets/image/personal_project/sources.json`에 유지합니다.
이미지 사용 권리는 각 원저작자에게 있습니다.
