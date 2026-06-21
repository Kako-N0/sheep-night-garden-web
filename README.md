# ひつじの夜庭 Web版

眠れない夜に、ひつじたちの静かな暮らしを眺めたり、ひつじや素数をゆっくり数えたりするための、小さなリラクゼーションWebアプリです。

このリポジトリは、**ひつじの夜庭 Web版** のソースコードを管理しています。
スマートフォンやPCのブラウザから利用でき、AndroidではChromeからホーム画面に追加してアプリのように使うこともできます。

## 概要

「ひつじの夜庭」は、眠る前の時間にそっと開けるような、静かな夜の雰囲気を大切にしたWebアプリです。

主な機能は以下の通りです。

* ひつじをゆっくり数える
* 素数ひつじを数える
* 10匹ごとに一時停止して、続けるか選べる
* BGMを切り替える
* 本日・昨日・累計のひつじ数を記録する
* Info / Settings / Credits 画面を表示する

Web版では、広告やアプリ内課金は表示していません。

## 技術構成

このWeb版は、フレームワークを使わず、シンプルな静的Webアプリとして作成しています。

使用技術は以下です。

* HTML
* CSS
* JavaScript
* LocalStorage
* GitHub Pages

ビルド処理を必要としないため、`index.html` をブラウザで開くだけでも基本的な動作確認ができます。
ローカル開発時は、`http-server` などの簡易サーバーを使って確認します。

## ディレクトリ構成

```text
.
├── index.html
├── index.css
├── app.js
├── assets/
│   ├── audio/
│   ├── icon/
│   └── sheep/
├── package.json
├── LICENSE
└── README.md
```

## 各ファイルの役割

### `index.html`

画面構造を定義しています。

主な画面は以下です。

* Home画面
* Counting画面
* Settings画面
* Info画面
* Credits画面

画面の切り替えは、`app.js` 側で `.active` クラスを付け替えることで行っています。

### `index.css`

アプリ全体の見た目を定義しています。

主な役割は以下です。

* 背景色・文字色などのデザイントークン管理
* ホーム画面のレイアウト
* カウント画面の中央配置
* Settings / Info / Credits 画面のカードUI
* スマートフォン・拡大表示への対応
* ボタンやカードのガラス風デザイン

背景色は、夜の雰囲気に合わせた濃い青をベースにしています。

### `app.js`

アプリの動作ロジックを管理しています。

主な処理は以下です。

* 画面遷移
* ひつじカウント
* 素数ひつじカウント
* 10匹ごとの一時停止
* BGMの再生・停止
* BGM種類の切り替え
* LocalStorageへの記録保存
* 本日・昨日・累計の集計
* Settings / Info / Credits 画面の操作

## カウント機能について

通常のひつじカウントでは、2秒ごとにひつじの数が増えます。

10匹ごとに一時停止し、画面にメッセージとひつじ画像を表示します。
「続ける」ボタンを押すと、再びカウントが再開されます。

素数ひつじカウントでは、通常の整数ではなく、次の素数へ進んでいきます。

例：

```text
2, 3, 5, 7, 11, 13, ...
```

素数ひつじも、10個数えるごとに一時停止します。

## データ保存について

記録はブラウザの `localStorage` に保存しています。

保存している主なデータは以下です。

* ひつじカウントの記録
* 素数ひつじカウントの記録
* BGM設定

外部サーバーへのデータ送信は行っていません。
記録は利用中のブラウザ内にのみ保存されます。

## BGMについて

BGMは以下の3種類を切り替えられます。

* ビブラフォン
* 焚き火
* 雨音

ブラウザの自動再生制限により、BGMはユーザー操作後に再生されます。

## ローカルでの起動方法

依存パッケージをインストールします。
```bash
npm install
```

ローカルサーバーを起動します。
```bash
npm start
```

## License

Source code is licensed under the MIT License.

Images, audio files, and other assets in the `assets/` directory are not covered by the MIT License.
Please do not reuse or redistribute them without permission from their respective rights holders.

## ライセンス

ソースコードは MIT License で公開しています。

ただし、`assets/` ディレクトリ内の画像・音声などの素材は MIT License の対象外です。
各素材の権利は、それぞれの権利者に帰属します。
無断での再利用・再配布はご遠慮ください。

## Credits

### Music

アプリ内BGMには、以下のフリーBGM・環境音を使用させていただいております。

* ビブラフォン
  DOVA-SYNDROME「雨の館Ⅲ」 / のる 様

* 焚き火
  Springin’ Sound Stock「焚き火 長」

* 雨音
  DOVA-SYNDROME「雨模様」 / 稿屋 隆 様

### Illustration

アプリ内のイラストにはAI生成画像を使用しています。

---

© 2026 Nozomi Kako
