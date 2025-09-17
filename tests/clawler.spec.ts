import { test, expect } from '@playwright/test';
import fs from 'fs';
import config from '../config.json';

// 設定値を取得
const TIMEOUT_MS = config.timeoutMs;

// Warning/Notice/Fatal Error/Parse Error 検出用
function hasPhpErrors(html: string) {
    return /<b>\s*(Warning|Notice|Fatal error|Parse error)\s*<\/b>/i.test(html);
}


// URLリストをファイルから読み込み
const urlsToTest: string[] = JSON.parse(fs.readFileSync('./test-urls.json', 'utf-8'));

test.describe('Check', () => {
  urlsToTest.forEach((url, index) => {
    const num = ('000' + (index + 1)).slice(-3);
    
    test(`${num}: ${url}`, async ({ page }) => {
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: TIMEOUT_MS });
        const html = await page.content();

          if (hasPhpErrors(html)) {
              console.log(`⚠️ PHP Error検出: ${url}`);
              expect(false, `${url} でPHP Errorを検出しました`).toBe(true);
          } else {
              console.log(`✅ OK: ${url}`);
          }

      } catch (error) {
        console.log(`❌ エラー: ${url} - ${error}`);
        
        // エラー情報をアノテーションに追加
        test.info().annotations.push({
          type: 'error',
          description: `${error}`
        });
        
        expect(false, `${url}でエラーが発生しました: ${error}`).toBe(true);
      }
    });
  });
});
