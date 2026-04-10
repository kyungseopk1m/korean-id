#!/usr/bin/env node
import { validate } from '../dist/mjs/validate.js';

const args = process.argv.slice(2);

const HELP = `
korean-id — 한국 식별번호 통합 검증 CLI

Usage:
  korean-id <value>          식별번호 자동 감지 및 검증
  korean-id --json <value>   JSON 형식으로 출력

Options:
  -h, --help     도움말
  -v, --version  버전 정보
  --json         JSON 출력

Examples:
  korean-id 119-81-10010
  korean-id M12345678
  korean-id 123가4567
  korean-id --json 900101-1123459
`.trim();

const TYPE_NAMES = {
  BRN: '사업자등록번호',
  RRN: '주민등록번호',
  CRN: '법인등록번호',
  FRN: '외국인등록번호',
  PCC: '개인통관고유부호',
  DLN: '운전면허번호',
  PASSPORT: '여권번호',
  VRN: '자동차등록번호',
};

if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
  console.log(HELP);
  process.exit(0);
}

if (args.includes('-v') || args.includes('--version')) {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');
  const dir = dirname(fileURLToPath(import.meta.url));
  const pkg = JSON.parse(readFileSync(join(dir, '..', 'package.json'), 'utf-8'));
  console.log(pkg.version);
  process.exit(0);
}

const jsonMode = args.includes('--json');
const value = args.filter((a) => a !== '--json').join(' ');

if (!value) {
  console.error('Error: 검증할 식별번호를 입력하세요.');
  process.exit(1);
}

const detected = validate(value);

if (jsonMode) {
  console.log(JSON.stringify(detected));
  process.exit(detected.type ? (detected.result.success ? 0 : 1) : 1);
}

if (!detected.type) {
  console.log(`✗ ${detected.message}`);
  process.exit(1);
}

const { type, result } = detected;
const name = TYPE_NAMES[type] || type;

if (result.success) {
  console.log(`✓ ${type} (${name})`);
  if (result.data) {
    for (const [key, val] of Object.entries(result.data)) {
      console.log(`  ${key}: ${val}`);
    }
  }
} else {
  console.log(`✗ ${type} (${name})`);
  console.log(`  ${result.message}`);
  process.exit(1);
}
