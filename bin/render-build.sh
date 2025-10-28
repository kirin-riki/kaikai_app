set -o errexit

cd backend
bundle install
bundle exec rails assets:precompile
bundle exec rails assets:clean