# 중보기도 기도제목 웹앱 (Next.js + Vercel Postgres)

## 구조
- `/` → 기도제목 제출 페이지
- `/admin` → 관리자 수합 페이지 (비밀번호 보호, 서버에서만 검증)
- `/api/prayers` → 목록 조회(GET) / 제출(POST)
- `/api/prayers/[id]` → 삭제(DELETE, 관리자 비밀번호 필요)
- `/api/admin/login` → 관리자 로그인 검증

## 클로드 코드에서 시작하는 법

```bash
npm install
npm run dev
```

`http://localhost:3000` 에서 확인 (단, DB 연결 전엔 API 호출 시 에러가 날 수 있어요 — Vercel Postgres 연결 후 정상 동작)

## Vercel 배포 순서

1. 이 폴더를 GitHub 저장소에 push
2. [vercel.com](https://vercel.com) 에서 **New Project → 해당 저장소 Import**
3. 배포되면 **Storage 탭 → Create Database → Postgres** 선택 후 프로젝트에 연결
   - 연결하면 `POSTGRES_URL` 등 환경변수가 자동으로 채워집니다
4. **Settings → Environment Variables** 에서 `ADMIN_PASSWORD` 값 추가 (예: `1234` 대신 원하는 비밀번호)
5. 다시 배포(Redeploy) 하면 완료!

배포 후:
- 제출 페이지: `https://프로젝트명.vercel.app`
- 관리자 페이지: `https://프로젝트명.vercel.app/admin`

## 기존 방식과 달라진 점
- 비밀번호가 **서버에만 저장**되어 (`ADMIN_PASSWORD` 환경변수) 파일을 열어봐도 안 보여요
- Google Sheets 대신 **Vercel Postgres**에 저장 (더 안정적, 자동 백업)
- 삭제 시에도 서버에서 비밀번호를 재검증
