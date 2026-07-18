#!/usr/bin/env bash
# SSM Parameter Store'daki /arti/prod/* secret'larını backend/.env'e render eder.
# EC2 IAM role'ünde ssm:GetParametersByPath izni gerektirir. (DEPLOY.md §3)
set -euo pipefail

PREFIX="/arti/prod"
ENV_FILE="$(cd "$(dirname "$0")/.." && pwd)/.env"

{
  echo "# Otomatik üretildi: deploy/render-env.sh — elle düzenleme, SSM'i güncelle"
  echo "NODE_ENV=production"
  echo "HOST=127.0.0.1"
  echo "PORT=5002"
  echo "STORAGE_PROVIDER=s3"
  echo "S3_BUCKET=arti-uploads-prod"
  echo "S3_REGION=eu-central-1"
  echo "REDIS_URL=redis://localhost:6379"
  echo "ALLOWED_ORIGINS=https://artiapp.com.tr"
  echo "PUBLIC_API_URL=https://api.artiapp.com.tr"
  # S3_PUBLIC_BASE CloudFront kurulunca eklenir

  aws ssm get-parameters-by-path \
    --path "$PREFIX" --with-decryption \
    --query 'Parameters[].[Name,Value]' --output text |
  while IFS=$'\t' read -r name value; do
    echo "${name##*/}=${value}"
  done
} > "$ENV_FILE"

chmod 600 "$ENV_FILE"
echo ".env yazıldı: $ENV_FILE"
