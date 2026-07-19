// Вендорит компоненты UI-KIT-goodwebman в packages/ui/src.
// Тянет дерево через GitHub API, качает каждый файл с raw.githubusercontent.
// Пропускает *.test.* и *.stories.* (в проде не нужны, тянут за собой test-deps).
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = 'goodwebman/UI-KIT-goodwebman';
const BRANCH = 'main';
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT_DIR = join(ROOT, 'packages', 'ui', 'src');

const SKIP = /\.(test|stories)\.[jt]sx?$/;
// Берём только исходники компонентов/утилит/иконок/стилей.
const INCLUDE_PREFIX = 'src/';

async function main() {
  const treeUrl = `https://api.github.com/repos/${REPO}/git/trees/${BRANCH}?recursive=1`;
  const res = await fetch(treeUrl, {
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'zuko-sync' },
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
  const { tree } = await res.json();

  const files = tree.filter(
    (n) => n.type === 'blob' && n.path.startsWith(INCLUDE_PREFIX) && !SKIP.test(n.path),
  );

  console.log(`Найдено ${files.length} файлов для вендоринга…`);
  let ok = 0;
  for (const file of files) {
    const rawUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${file.path}`;
    const r = await fetch(rawUrl, { headers: { 'User-Agent': 'zuko-sync' } });
    if (!r.ok) {
      console.warn(`  skip ${file.path} (${r.status})`);
      continue;
    }
    const content = await r.text();
    // src/foo/Bar.tsx -> packages/ui/src/foo/Bar.tsx
    const rel = file.path.slice(INCLUDE_PREFIX.length);
    const dest = join(OUT_DIR, rel);
    await mkdir(dirname(dest), { recursive: true });
    await writeFile(dest, content, 'utf8');
    ok++;
  }
  console.log(`Готово: ${ok}/${files.length} файлов записано в packages/ui/src`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
