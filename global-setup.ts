import { chromium, FullConfig } from '@playwright/test';
import fs from 'fs';
import config from './config.json';

// 設定値を取得
const START_URL = config.startUrl;
const MAX_DEPTH = config.maxDepth;
const SAME_ORIGIN_ONLY = config.sameOriginOnly;
const TIMEOUT_MS = config.timeoutMs;
const DENY_PATTERNS = config.denyPatterns;
const MAX_PAGES = config.maxPages;

// URLが拒否パターンに一致するかチェック
function isDeniedUrl(url: string): boolean {
  return DENY_PATTERNS.some(pattern => {
    const regex = new RegExp(pattern);
    return regex.test(url);
  });
}

async function extractLinks(page: any, baseUrl: string): Promise<string[]> {
  const hrefs = await page.$$eval('a[href]', as =>
    as.map(a => a.getAttribute('href')).filter(Boolean)
  );
  const result: string[] = [];
  const baseUrlObj = new URL(baseUrl);
  
  for (const href of hrefs) {
    try {
      const abs = new URL(href!, baseUrl);
      abs.hash = '';
      
      // プロトコルチェック
      if (!['http:', 'https:'].includes(abs.protocol)) {
        continue;
      }
      
      // 同一オリジンのみの設定チェック
      if (SAME_ORIGIN_ONLY && abs.origin !== baseUrlObj.origin) {
        continue;
      }
      
      // 拒否パターンチェック
      if (isDeniedUrl(abs.toString())) {
        continue;
      }
      
      result.push(abs.toString());
    } catch { /* noop */ }
  }
  return Array.from(new Set(result));
}

async function collectUrls(): Promise<string[]> {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const visited = new Set<string>();
  const queue: { url: string; depth: number }[] = [{ url: START_URL, depth: 0 }];
  let pageCount = 0;

  try {
    while (queue.length > 0 && pageCount < MAX_PAGES) {
      const { url, depth } = queue.shift()!;
      if (visited.has(url)) continue;
      visited.add(url);
      pageCount++;

      console.log(`URL収集中: ${url} (${pageCount}/${MAX_PAGES}, 深度: ${depth})`);

      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: TIMEOUT_MS });
        
        if (depth < MAX_DEPTH) {
          const links = await extractLinks(page, url);
          for (const link of links) {
            if (!visited.has(link)) {
              queue.push({ url: link, depth: depth + 1 });
            }
          }
        }
      } catch (error) {
        console.log(`URL収集エラー: ${url} - ${error}`);
      }
    }
  } finally {
    await browser.close();
  }

  console.log(`URL収集完了: ${visited.size}個のURLを収集しました`);
  return Array.from(visited);
}

async function globalSetup(config: FullConfig) {
  console.log('Global Setup: URL収集を開始します...');
  
  const urls = await collectUrls();
  
  // URLリストをファイルに保存
  fs.writeFileSync('./test-urls.json', JSON.stringify(urls, null, 2));
  console.log(`Global Setup完了: ${urls.length}個のURLをtest-urls.jsonに保存しました`);
}

export default globalSetup;

