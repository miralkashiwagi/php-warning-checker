# どんなプログラムか
TOPページのURLを渡すと、そこからリンクされているページをクロールして、PHPのWarningやNotice等のエラーが出力されているページを探すPlaywright

# 使い方
## Playwright の実行
1. `npm install`
2. config.jsonの`startUrl`にサイトのTOPページURLを入れる
   - `maxDepth`はお好みで調整(1の場合は`startUrl`にリンクがあるURLのみをチェック)
3. `npm start`
4. レポートが自動で開く or `npx playwright show-report` で開くので確認

## レポートの確認
- URLごとにテストが実行されます
- エラーが検出されたページは × 、無かったページは ✓ が表示されます
- × のページのURLを開いて、該当のエラーを確認してください

## こんなときは
### `npm start` したら Error: browserType.launch: Executable doesn't exist at .... のようなエラーが出た
Playwrightのブラウザバージョンが古い（または入っていない）ようです。  
メッセージ内に

```
npx playwright install
```

と書いてあるはずなので、このコマンドを実行してPlaywrightのブラウザをインストール（アップデート）してください。


