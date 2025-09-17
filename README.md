# どんなプログラムか
TOPページのURLを渡すと、そこからリンクされているページをクロールして、PHPのWarningやNotice等のエラーが出力されているページを探すPlaywright

# 使い方
## Playwright の実行
1. `npm install`
2. config.jsonの`startUrl`にサイトのURLを入れる
   - `maxDepth`はお好みで調整(1の場合は`startUrl`にリンクがあるURLのみをチェック)
3. `npm start`
4. レポートが自動で開く or `npx playwright show-report` で開くので確認

## レポートの確認
- URLごとにテストが実行されます
- エラーが検出されたページは × 、無かったページは ✓ が表示されます
- × のページのURLを開いて、該当のエラーを確認してください

## 設定ファイルの説明
- "startUrl": サイトのURLを入れてください（TOPページ or リンクを辿る元として使いたいページ）
- "maxDepth": 通常は1。より多くのページをクロールしたいときは2にしてください。
- "sameOriginOnly": 通常はtrue。falseにすると外部URLもクロールする。
- "timeoutMs": タイムアウトさせる時間。応答の遅いページで処理が止まらないようにする。
- "denyPatterns": 除外するURLを指定できる。例えば`[".*\\.pdf$","/admin/.*"]`
- "maxPages": クロールするページの上限を決められる。例えばmaxDepthは2だけど100ページで終わりにするなど。
}


## こんなときは
### `npm start` したら Error: browserType.launch: Executable doesn't exist at .... のようなエラーが出た
Playwrightのブラウザバージョンが古い（または入っていない）ようです。  
メッセージ内に

```
npx playwright install
```

と書いてあるはずなので、このコマンドを実行してPlaywrightのブラウザをインストール（アップデート）してください。


