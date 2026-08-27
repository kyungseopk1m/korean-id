# Contributing

## 개발 환경 설정

```bash
git clone https://github.com/kyungseopk1m/korean-id.git
cd korean-id
npm install
```

## 개발 명령어

```bash
npm test          # 단위 테스트 실행
npm run build     # CJS/ESM 빌드
npm run test:cli  # CLI 테스트 (npm run build 를 먼저 돌려야 한다)
npm run check     # attw + publint 확인
```

## PR 가이드라인

- 새 식별번호 타입 추가 시 `src/`, `__test__/`, `README.md`, `CHANGELOG.md` 모두 업데이트
- 테스트 작성 필수 (유효/무효 케이스 모두)
- 체크섬이 공개된 경우에는 알고리즘을 반드시 구현하고, 비공개인 경우에는 포맷 검증으로 대체한 뒤 그 사실을 문서에 명시합니다

## 라이선스

기여한 코드는 [MIT](LICENSE) 라이선스에 따라 배포됩니다.
