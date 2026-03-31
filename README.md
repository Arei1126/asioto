# Asioto

加速度センサーで歩行を検知し、1歩ごとに足音を鳴らす React + PWA アプリです。

## Features

- React を UI 層に限定し、Clean Architecture 風に責務を分離
- モーションセンサー入力から 1 歩ずつトリガー
- 初期音源は WebAudio の矩形波
- オプションで音声ファイルを読み込み、足音として再生
- PWA 対応（manifest + service worker）
- GitHub Project Pages へデプロイ可能

## Architecture

主要ディレクトリ:

- `src/presentation`: UI 表示とユーザー操作
- `src/application`: ユースケースと状態管理
- `src/domain`: 歩行検知ロジックとポート定義
- `src/infrastructure`: DeviceMotion/WebAudio の実装

データフロー:

1. `BrowserMotionSensor` が加速度サンプルを取得
2. `StepDetector` が閾値 + 不応期で step 判定
3. `FootstepController` が状態更新
4. `WebAudioFootstepPlayer` が矩形波または音声ファイルを再生

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Project Pages 用 base path ビルド:

```bash
npm run build:pages
```

## GitHub Pages

このリポジトリには [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) を含んでいます。

1. GitHub 側で Pages の Source を `GitHub Actions` に設定
2. `main` ブランチへ push
3. Workflow が `dist` を Pages にデプロイ

## Sensor Notes

- iOS Safari では、ユーザー操作時にモーション許可が必要
- デスクトップではセンサーが使えないため `unsupported` になる場合あり

## Stair Detection

高度センサーそのものではなく、加速度の鉛直成分から「階段らしさ」を推定する簡易実装です。
将来的に気圧センサーや外部データを統合する拡張ポイントを追加しやすい構成にしてあります。
