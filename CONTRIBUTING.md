# Contributing

## 개발 환경 설정

```bash
git clone https://github.com/kyungseopk1m/korean-id.git
cd korean-id
npm install
```

## 개발 명령어

```bash
npm test          # 전체 테스트 실행
npm run build     # CJS/ESM 빌드
npm run check     # attw + publint 확인
```

## PR 가이드라인

- 새 식별번호 타입 추가 시 `src/`, `__test__/`, `README.md`, `CHANGELOG.md` 모두 업데이트
- 테스트 작성 필수 (유효/무효 케이스 모두)
- 체크섬이 공개된 경우 반드시 알고리즘 구현, 비공개인 경우 포맷 검증으로 대체 후 명시

## 라이선스

기여한 코드는 [MIT](LICENSE) 라이선스에 따라 배포됩니다.
