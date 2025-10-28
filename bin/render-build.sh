#!/usr/bin/env bash
# exit on error
set -o errexit

# カレントディレクトリを確認
echo "Current directory: $(pwd)"
ls -la

# backendディレクトリに移動
if [ -d "backend" ]; then
  cd backend
elif [ -d "kaikai_app/backend" ]; then
  cd kaikai_app/backend
else
  echo "Error: backend directory not found"
  exit 1
fi

echo "Changed to: $(pwd)"

# bundlerをインストール
gem install bundler

# 依存関係をインストール
bundle install

# データベースのセットアップ（本番環境）
# bundle exec rails db:create
# bundle exec rails db:migrate