# 移植にともなう変更点まとめ

iOSアプリ（React Native / Expo）として動作していた「ひつじの夜庭 (Sheep Night Garden)」を、Webブラウザで直接動作する静的Webアプリ（HTML/CSS/JS）に移植しました。

## 1. 新規作成したファイル (Web版)

Webアプリの入り口およびロジック・デザインを構築するため、`web/app/` 以下に以下のファイルを新規作成しました。

| ファイル名 | 役割・実装内容 |
| :--- | :--- |
| **[app/index.html](file:///C:/Users/nozom/programs/sheep-night-garden/web/app/index.html)** | Webアプリのエントリーポイント。iOS版の画面（ホーム、設定、Info、Credits、応援）をSPA（シングルページアプリケーション）構成で実装。アイコン等はインラインSVGで埋め込み。 |
| **[app/index.css](file:///C:/Users/nozom/programs/sheep-night-garden/web/app/index.css)** | iOS版のデザインシステムとプレミアムなアニメーションを再現。グラスモルフィズム、夜空の月や星のまたたき、雨滴の落下、焚き火のゆらぎ、ひつじの歩行やバウンス等をすべてCSS Keyframesで記述。 |
| **[app/app.js](file:///C:/Users/nozom/programs/sheep-night-garden/web/app/app.js)** | React NativeのUI・状態管理ロジックをVanilla JavaScriptに移植。履歴スタックを用いた画面遷移、localStorageによるデータ保存、BGM再生の制御、時間帯（夜時間設定）による背景の自動切り替えを制御。 |

## 2. 更新したファイル

* **[package.json](file:///C:/Users/nozom/programs/sheep-night-garden/web/package.json)**
  * React Native / Expo 関連の依存関係をすべて削除しました。
  * ローカルでのWebアプリ起動用に、軽量サーバー `http-server` のみを追加。
  * `npm start` または `npm run dev` で `http-server app` を起動し、すぐにWeb版をプレビューできるようスクリプトを整備。

## 3. 不要になったため削除したiOS向けコード・ファイル

Webアプリとしての移植が完了したため、以下のReact Native / Expo関連のファイルは使用されていません。これらはすべて安全に削除されました。

* **`web/app/` 配下の古いコンポーネント (TypeScript):**
  * `_layout.tsx` (ルーティング設定)
  * `credits.tsx` (クレジット画面)
  * `donate.tsx` (応援画面)
  * `index.tsx` (メイン画面)
  * `info.tsx` (情報画面)
  * `settings.tsx` (設定画面)
* **`web/src/` ディレクトリ配下すべて:**
  * `context/AudioContext.tsx`
  * `utils/stats.ts`
  * `config/sheep.ts`
* **プロジェクトルートのExpo設定ファイル:**
  * `app.json`
  * `eas.json`
  * `metro.config.js`
  * `babel.config.js`
  * `tsconfig.json`
  * `.expo/` (一時キャッシュディレクトリ)

## 4. Web版の起動方法

以下の手順で、ローカルでWebアプリをホストして動作を確認できます。

1. **依存関係のインストール** (初回のみ):
   ```bash
   npm install
   ```
2. **ローカルサーバーの起動**:
   ```bash
   npm start
   ```
3. **ブラウザでアクセス**:
   起動後、ブラウザで **[http://localhost:8080/app/](http://localhost:8080/app/)** にアクセスすると、Webアプリ版の「ひつじの夜庭」が動作します。
   *(※画像や音声アセットが `web/assets/` にあるため、プロジェクトルートからホストし、`/app/` ディレクトリにアクセスする必要があります。)*
