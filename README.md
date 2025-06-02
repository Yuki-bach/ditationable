# Dictationable

Google Gemini APIを使用したAI音声認識による話者分離機能付き文字起こしアプリケーション

<img src="https://i.gyazo.com/9b2bbe6b7aac80d25922a8d0ef99a26b.png" alt="Dictationable アプリケーション画面" width="600">

## 機能

- 🎙️ 話者分離機能付き音声ファイル文字起こし
- 🔊 複数の音声フォーマット対応 (WAV, MP3, AIFF, AAC, OGG, FLAC, M4A)
- 👥 自動話者識別・ラベリング
- ⏱️ セグメント毎のタイムスタンプ生成
- 🌐 日本語・英語の多言語対応
- 📝 カスタマイズ可能なシステムプロンプト
- 📄 TXT・JSON形式でのダウンロード
- 🔒 セキュアなAPIキー管理（メモリ内のみ）
- 🐳 Docker開発環境

## 必要な環境

- Docker Desktop
- Google Gemini API キー

## セットアップ

1. リポジトリをクローンします：
```bash
git clone <repository-url>
cd dictationable
```

2. Dockerコンテナをビルド・起動します：
```bash
docker-compose up --build
```

3. ブラウザで `http://localhost:3000` にアクセスします

## 使用方法

1. Gemini APIキーを入力して「設定」をクリック
2. 音声ファイルをアップロード（最大9.5時間）
3. 話者数と背景情報を設定（任意）
4. システムプロンプトをカスタマイズ（必要に応じて）
5. 「文字起こし開始」をクリック
6. 結果をTXTまたはJSON形式でダウンロード

## 開発コマンド

```bash
# 開発サーバー起動
docker-compose up

# コンテナ再ビルド
docker-compose build

# コンテナ停止
docker-compose down

# ログ表示
docker-compose logs -f

# コンテナ内でシェル実行
docker-compose exec app bash
```

## 技術仕様

### API制限
- 音声最大長：1リクエスト9.5時間
- インライン処理最大ファイルサイズ：20MB
- 大きなファイルはGoogle Files APIを使用
- 音声は16 Kbpsにダウンサンプリング

### セキュリティ
- APIキーはブラウザメモリ内のみに保存
- データの永続化・ログ記録なし
- 全処理はメモリ内で完結
- 本番環境ではHTTPS必須

### 技術スタック
- **フロントエンド**: Next.js 14 (App Router), React, TypeScript
- **スタイリング**: Tailwind CSS
- **API**: Google Gemini 2.0 Flash Experimental
- **コンテナ**: Docker, Docker Compose
- **国際化**: カスタムi18nシステム

## プロジェクト構成

```
dictationable/
├── app/
│   ├── components/          # UIコンポーネント
│   ├── contexts/           # React Context（言語設定等）
│   ├── lib/               # ユーティリティ・サービス
│   ├── api/               # API エンドポイント
│   └── page.tsx           # メインページ
├── docs/
│   └── spec.md           # 仕様書
├── docker-compose.yml    # Docker設定
├── Dockerfile.dev        # 開発用Dockerfile
└── README.md
```
