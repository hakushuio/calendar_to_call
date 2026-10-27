# calendar_to_call

月曜始まりの月間カレンダーに、会社名の予定リンクを表示するサンプルです。
ブラウザーで `index.html` を開くと、2021年10月のサンプルを表示します。
表示自体にNode.jsやnpmパッケージは必要ありません。

## ファイルの役割

- `calendar_to_call.js`: 年月と予定を受け取り、カレンダーのHTMLを生成します。
- `calendar-demo.js`: サンプル予定を定義し、生成したHTMLをDOMに挿入します。
- `calendar_to_call.css`: カレンダーと予定リンクの見た目を定義します。
- `calendar_to_call.test.cjs`: Node.js標準機能による回帰テストです。

## API

`setCalendar({ ym, db })` はHTML文字列を返します。
`ym` は `YYYY/MM` 形式で、省略すると現在の年月になります。
`db` は予定の配列で、省略できます。
予定の各フィールドはJavaScript内のJSDocで説明しています。

会社名と属性はHTMLエスケープしますが、リンク先の安全性検証は行いません。
`js_function` はJavaScriptも実行できる既存仕様なので、信頼できるコードで指定してください。
外部入力をそのまま渡す用途には対応していません。

## 開発とチェック

開発ツールにはNode.js 24以降とnpmを使用します。
ESLint、Prettier、JSDoc型検査用のTypeScriptは開発時だけの依存です。

```sh
npm ci
npm run check
```

- `npm run lint`: ESLint推奨ルールでJavaScriptを検査。
- `npm run format`: HTML、CSS、JavaScript、設定、文書をPrettierで整形。
- `npm run format:check`: 整形の差分を検査。
- `npm run typecheck`: ブラウザー用JavaScriptのJSDoc型を検査。
- `npm test`: 回帰テストを実行。

整形ルールはPrettier、コードの問題検出はESLintが担当します。
