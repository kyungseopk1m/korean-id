// dist가 있어야 돌아간다. `npm run test:cli`가 build 후 실행한다 (jest.config.mjs에서 기본 실행 제외).
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const bin = join(root, 'bin', 'korean-id.js');

/** CLI를 돌리고 stdout과 exit code를 돌려준다. */
function run(...args: string[]): { out: string; code: number } {
  try {
    const out = execFileSync(process.execPath, [bin, ...args], { encoding: 'utf-8' });
    return { out, code: 0 };
  } catch (e) {
    const err = e as { stdout?: string; stderr?: string; status?: number };
    return { out: (err.stdout ?? '') + (err.stderr ?? ''), code: err.status ?? 1 };
  }
}

describe('CLI', () => {
  it('dist가 빌드돼 있다', () => {
    // 이 단언이 실패하면 `npm run build`를 먼저 돌려야 한다. 조용히 스킵하지 않는다.
    expect(existsSync(join(root, 'dist', 'mjs', 'validate.js'))).toBe(true);
  });

  describe('종료 코드', () => {
    it('유효한 입력은 0을 낸다', () => {
      expect(run('119-81-10010').code).toBe(0);
    });

    it('무효한 입력은 1을 낸다', () => {
      expect(run('119-81-10011').code).toBe(1);
    });

    it('감지 불가 입력은 1을 낸다', () => {
      expect(run('12345').code).toBe(1);
    });

    it('입력이 없으면 도움말과 0을 낸다', () => {
      const r = run();
      expect(r.code).toBe(0);
      expect(r.out).toContain('Usage:');
    });
  });

  describe('타입 감지', () => {
    it.each([
      ['119-81-10010', 'BRN'],
      ['900101-1123459', 'RRN'],
      ['110111-0006249', 'CRN'],
      ['900101-5123452', 'FRN'],
      ['P123456789012', 'PCC'],
      ['11-22-123456-78', 'DLN'],
      ['M12345678', 'PASSPORT'],
      ['123가4567', 'VRN'],
    ])('%s → %s', (value, type) => {
      const r = run(value);
      expect(r.code).toBe(0);
      expect(r.out).toContain(`✓ ${type}`);
    });

    it('차세대 여권 형식도 감지한다', () => {
      expect(run('M123A4567').out).toContain('✓ PASSPORT');
    });

    it('지역명 사업용 번호판도 감지한다', () => {
      const r = run('서울', '82바', '1234');
      expect(r.code).toBe(0);
      expect(r.out).toContain('✓ VRN');
      expect(r.out).toContain('region: 서울');
    });
  });

  describe('--json', () => {
    it('파싱 가능한 JSON 한 줄을 낸다', () => {
      const r = run('--json', 'M12345678');
      expect(r.code).toBe(0);
      expect(JSON.parse(r.out)).toEqual({
        type: 'PASSPORT',
        result: { success: true, data: { type: '복수여권', prefix: 'M', format: 'legacy' } },
      });
    });

    it('실패 결과에 code가 실린다', () => {
      const r = run('--json', '119-81-10011');
      expect(r.code).toBe(1);
      expect(JSON.parse(r.out)).toMatchObject({
        type: 'BRN',
        result: { success: false, code: 'INVALID_CHECKSUM' },
      });
    });
  });

  describe('--no-checksum', () => {
    it('없으면 2020-10 이후 주민등록번호가 CRN 실패로 나온다', () => {
      const r = run('900101-1123450');
      expect(r.code).toBe(1);
      expect(r.out).toContain('✗ CRN');
    });

    it('주면 RRN으로 통과한다', () => {
      const r = run('--no-checksum', '900101-1123450');
      expect(r.code).toBe(0);
      expect(r.out).toContain('✓ RRN');
      expect(r.out).toContain('birthDate: 1990-01-01');
    });

    it('외국인등록번호에도 적용된다', () => {
      expect(run('--no-checksum', '900101-5123451').out).toContain('✓ FRN');
    });

    it('--json과 함께 쓸 수 있다', () => {
      const r = run('--no-checksum', '--json', '900101-1123450');
      expect(JSON.parse(r.out)).toMatchObject({ type: 'RRN', result: { success: true } });
    });

    it('플래그가 검증 대상 값으로 새어들어가지 않는다', () => {
      // 플래그를 값에 이어붙이면 'M12345678 --no-checksum'이 되어 감지가 깨진다.
      expect(run('--no-checksum', 'M12345678').out).toContain('✓ PASSPORT');
    });

    it('체크섬을 꺼도 생년월일은 계속 검증한다', () => {
      expect(run('--no-checksum', '901301-1123450').code).toBe(1);
    });
  });

  describe('--help / --version', () => {
    it('--help는 --no-checksum을 안내한다', () => {
      const r = run('--help');
      expect(r.code).toBe(0);
      expect(r.out).toContain('--no-checksum');
    });

    it('--version은 package.json의 버전을 낸다', () => {
      const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf-8')) as { version: string };
      expect(run('--version').out.trim()).toBe(pkg.version);
    });
  });
});
