# Changelog

All notable changes to Takei-prime will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - 2025-10-26

#### Core Features
- Fitスコア計算エンジン（Python & TypeScript）
  - SkillMatch計算
  - Retention計算（Big Five性格分析）
  - Friction計算
  - Preferenceプリセット（5モード）

#### Frontend
- Next.js 14 (App Router) セットアップ
- ダッシュボード（組織図ビュー）
  - 階層構造表示（部署 → チーム）
  - 展開/折りたたみ機能
  - 部署別平均Fitスコア
- 候補者一覧
  - Fitスコア棒グラフ（複数チーム比較）
  - フィルター機能（名前、スキル、経験年数、リモートワーク）
- 候補者詳細
  - Big Five性格プロファイル（レーダーチャート）
  - スキルレベル表示
  - おすすめチームトップ10
- チーム一覧・詳細
  - おすすめ候補者表示
  - チーム文化プロファイル
- Fitスコア計算画面
  - 候補者×チーム選択
  - Preferenceモード切り替え
  - リアルタイム計算
- Fitスコア結果表示
  - 総合スコア + 内訳
  - レーダーチャート
  - 強み・リスク・対策

#### Data
- 組織構造データ（13部署、階層定義）
- チームデータ（43チーム）
- 候補者データ（50人）
- スキルマスター（25種類）

#### Documentation
- プロジェクト概要（README.md）
- 開発計画書 v2
- アーキテクチャ設計書
- 技術スタック詳細
- UXビジョン
- 実装ロードマップ
- セットアップガイド
- 各種完成報告書

---

## [0.1.0] - 2025-10-26

### Initial Release
- プロジェクト初期セットアップ
- MVP実装完了
- デモデータ作成
- GitHubリポジトリ公開

