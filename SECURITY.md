# セキュリティ通知

## ⚠️ 重要: Master Key のローテーション実施済み

**日付**: 2025-10-28

### 概要
過去のコミット（223c2d7, 4629443）において、Rails の `config/master.key` が誤ってGitリポジトリに含まれていました。

### 実施した対応

1. **Master Key の再生成**
   - 古い master.key: `589c1231f29c83ca2f559c0a9fd3eb03` （無効化済み）
   - 新しい master.key: 生成済み（Gitリポジトリには含まれていません）

2. **Credentials の再暗号化**
   - `config/credentials.yml.enc` を新しい master.key で再暗号化
   - 古い master.key では復号化できません

3. **.gitignore の修正**
   - `**/config/master.key` を追加
   - `**/config/credentials.yml.enc` を追加
   - すべてのサブディレクトリで機密ファイルが無視されるように修正

### 影響範囲

- **開発環境**: 古い master.key は無効です。新しい master.key が必要です。
- **本番環境**: デプロイ時に新しい master.key を環境変数として設定してください。
- **機密情報の漏洩**: credentials.yml.enc にはデフォルトのテンプレートのみが含まれていたため、実際の機密情報（AWS キー、SMTP パスワードなど）の漏洩はありませんでした。

### 開発者向けの対応

古い master.key をお持ちの場合は削除してください：

```bash
# バックエンドディレクトリで実行
docker compose exec backend bash -c "rm -f config/master.key"
```

新しい master.key は、プロジェクトのセキュアなストレージから取得するか、チームリーダーに問い合わせてください。

### セキュリティベストプラクティス

今後、以下のファイルは**絶対にGitにコミットしないでください**：

- `config/master.key`
- `.env` ファイル
- データベースのパスワード
- API キーやトークン
- その他の機密情報

### 質問・報告

セキュリティに関する質問や問題を発見した場合は、イシューを作成するか、プロジェクト管理者に直接連絡してください。

---

**最終更新**: 2025-10-28
