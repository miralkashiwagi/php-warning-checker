import { test, expect } from '@playwright/test';
import fs from 'fs';
import config from '../config.json';

// 設定値を取得
const TIMEOUT_MS = config.timeoutMs;

// Warning/Notice/Fatal Error/Parse Error 検出用
function hasPhpErrors(html: string) {
    return /<b>\s*(Warning|Notice|Fatal error|Parse error)\s*<\/b>/i.test(html);
}
// PHPエラーの詳細を抽出する関数
function extractPhpErrors(html: string): string[] {
    const errorPattern = /<b>\s*(Warning|Notice|Fatal error|Parse error)\s*<\/b>:\s*(.+?)(?=<br|<\/)/gi;
    const errors: string[] = [];
    let match;

    while ((match = errorPattern.exec(html)) !== null) {
        const errorType = match[1];
        const errorMessage = match[2];
        errors.push(`<b>${errorType}</b>: ${errorMessage}`);
    }

    return errors;
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
              const errorDetails = extractPhpErrors(html);
              console.log(`⚠️ PHP Error検出: ${url}`);
              errorDetails.forEach(error => {
                  console.log(`  ${error}`);
              });

              // Annotationsにのみ詳細を記録
              test.info().annotations.push({
                  type: 'error',
                  description: `${errorDetails.join('\n')}\n-------------\n`
              });

              // テスト失敗は最小限のメッセージで
              throw new Error(`${url} でPHP Errorを検出しました`);
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
