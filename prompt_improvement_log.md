# 프롬프트 개선 기록장 (Prompt Improvement & Troubleshooting Log)

이 문서는 개발 과정에서 발생한 오류 해결 과정, 사용자가 제시한 수정 요청 프롬프트, 그리고 개선 결과를 투명하고 구체적으로 기록하는 공간입니다. 심사 항목 중 **기획·프롬프트 설계 및 트러블슈팅 과정 (40점)** 및 **발표 자료 트러블슈팅 사례**의 증빙 자료로 활용됩니다.

---

## 📈 프롬프트 및 트러블슈팅 로그 요약

| ID | 날짜 / 시간 | 관련 기능 / 파일 | 오류 내용 / 개선 요구사항 | 해결 여부 |
|:---|:---|:---|:---|:---|
| #01 | 2026-07-09 | Git 초기화 및 환경 설정 | README.md 수정 및 원격 저장소 동기화 | 완료 (Success) |

---

## 📝 상세 트러블슈팅 및 프롬프트 개선 이력

### #01. README.md 업데이트 및 원격 저장소 동기화
- **발생 날짜 / 시간**: 2026-07-09T14:00:46+09:00
- **관련 기능 / 컴포넌트**: 저장소 초기화 및 문서화 (`README.md`)

#### 1. 오류 발생 과정 및 분석 (Error & Context)
- **오류/상황**: 최초 저장소 생성 시 기본 템플릿 `# team-pj-frontend`로 README.md가 커밋 및 푸시되어 있었으나, 해커톤 목적을 명확히 전달하고 심사 기준을 반영하기 위해 README 제목을 프로젝트 성격에 걸맞은 한글 제목으로 직관적으로 변경할 필요가 생겼음.
- **원인/필요성**: 단순 코드 나열이 아닌 심사위원들이 직관적으로 볼 수 있도록 README.md의 타이틀을 구체화해야 함.

#### 2. 수정 요청 프롬프트 (User Request Prompt)
```text
Readme에 DGSW-해커톤 프론트엔드 보관 Git 이라고 해줘
```

#### 3. AI 에이전트 개선 결과 및 대응 (Resolution & Outcome)
- **수행 작업**:
  - `README.md` 파일을 `# DGSW-해커톤 프론트엔드 보관 Git`으로 갱신함.
  - 변경된 README.md를 스테이징하고 `docs: update README with project description` 커밋 메시지와 함께 로컬에 커밋함.
  - 원격 저장소 `origin/main`으로 즉시 `git push`를 실행하여 원격 저장소를 실시간 동기화 완료함.
- **개선 결과**: 저장소 메인 페이지가 해커톤 프로젝트 보관용임을 직관적으로 식별할 수 있도록 개선됨.

---

### #02. UI/UX 라이트 모드(Light Mode) 디자인 테마 변경
- **발생 날짜 / 시간**: 2026-07-09T15:20:00+09:00
- **관련 기능 / 컴포넌트**: 전역 CSS 및 모든 화면 컴포넌트 디자인 시스템

#### 1. 오류 발생 과정 및 분석 (Error & Context)
- **상황**: 당초 기획 단계에서는 『노 휴먼스랜드』의 어두운 아포칼립스적 미래상을 반영하여 '어두운 네온 대시보드' 테마를 메인으로 삼았으나, 사용자가 "라이트모드로 해줘"라는 명확한 디자인 가이드라인 변경을 지시함.
- **원인/분석**: 어두운 네온 스타일의 색상 규칙들을 그대로 밝은 배경에 투사할 경우 글씨 명암비가 낮아져 가독성이 크게 하락하고, 고품격 글래스모피즘 효과가 깨지는 심미적 부조화가 발생함. 따라서 소프트 슬레이트 백그라운드(`bg-slate-50`) 위에 밝고 깨끗한 화이트 유리판(`.glass-panel`)과 명도/채도가 세밀하게 계산된 컬러 악센트 테두리로 전면 리스타일링을 단행함.

#### 2. 수정 요청 프롬프트 (User Request Prompt)
```text
라이트모드로 해줘
```

#### 3. AI 에이전트 개선 결과 및 대응 (Resolution & Outcome)
- **수행 작업**:
  - `src/index.css`를 대폭 갱신하여 라이트 모드 전용 글래스모피즘 CSS 변수 및 클래스 재설계.
  - `src/components/` 산하의 `Header.tsx`, `StatCard.tsx`, `Dashboard.tsx`, `EnergySimulator.tsx`, `ReportForm.tsx`, `ReportMap.tsx`, `AdminPanel.tsx`, `ProjectInfo.tsx` 전원을 화이트/에메랄드/시안 톤의 맑고 우아한 Luminous Light 테마로 전면 교체.
- **개선 결과**: 사용자 시인성이 극대화되고, 미래지향적이면서도 현대적인 느낌의 프리미엄 화이트 대시보드 디자인 시스템 구축 완료.

---

### #03. TypeScript 엄격한 빌드 규칙 충족 및 PostCSS 빌드 오류 해결
- **발생 날짜 / 시간**: 2026-07-09T15:45:00+09:00
- **관련 기능 / 컴포넌트**: 빌드 파이프라인 (`npm run build`, `postcss.config.js`) 및 타입 임포트 구문

#### 1. 오류 발생 과정 및 분석 (Error & Context)
- **오류/상황**: 프로덕션 빌드 검증을 위해 `npm run build`를 구동했을 때 아래 2가지 치명적 에러 발생:
  1. `error TS1484: 'TabType' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.` (및 다수 파일의 타입 임포트 에러)
  2. `error TS6133` (사용되지 않는 변수 및 아이콘 임포트 에러)
  3. `[postcss] It looks like you're trying to use tailwindcss directly as a PostCSS plugin...` (PostCSS와 Tailwind CSS v4 간의 호환 빌드 실패)
- **원인 분석**: 
  - `tsconfig.json`에 `verbatimModuleSyntax`가 활성화되어 있어 엄격하게 `import type`을 선언하지 않으면 타입 컴파일러가 번들링 중 예외를 발생시킴.
  - Tailwind CSS v4가 설치되어 포스트프로세서로 구동될 때, 기존 v3 스타일의 PostCSS 플러그인 설정(`tailwindcss: {}`)은 호환되지 않으므로 `@tailwindcss/postcss` 플러그인을 거쳐 빌드되어야 함.

#### 2. 수정 요청 프롬프트 (User Request Prompt)
- *상황에 근거하여 AI 에이전트가 프로덕션 품질 및 완벽성을 위해 자율 트러블슈팅 및 프롬프트 연동 조치를 건의함.*

#### 3. AI 에이전트 개선 결과 및 대응 (Resolution & Outcome)
- **수행 작업**:
  - **코드 수준 수정**: `src/App.tsx`, `src/components/Header.tsx`, `src/context/EcoCityContext.tsx` 등 8개 이상의 원본 소스 파일에서 타입 임포트 구문을 전원 `import type { ... }`로 교체 완료. 사용되지 않는 변수 및 불필요하게 로드되던 Lucide 아이콘 리소스를 전면 삭제하여 엄격한 TS 빌드 통과.
  - **포스트 프로세서 고도화**: `@tailwindcss/postcss` 패키지를 신규 설치하고, `postcss.config.js` 파일의 빌드 대상을 `'@tailwindcss/postcss'`로 변경함.
- **개선 결과**: `npm run build` 명령이 아무런 에러나 경고 없이 완벽히 빌드를 완료하여 번들링 파일(`dist/`)을 생성했으며, `npm run dev` 서버가 `http://localhost:5173/`에서 정상 작동 개시됨.

---

*(이후 발생할 오류, 개선 요구사항 및 트러블슈팅 사례는 위 포맷을 기반으로 #04, #05... 순서대로 구체적으로 누적 기록합니다.)*
