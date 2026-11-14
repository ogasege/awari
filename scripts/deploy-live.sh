#!/bin/sh
# Builds with the live quiz endpoint, uploads to the site bucket, invalidates CloudFront.
# Run it yourself from the repo root: AWS_PROFILE=<your-aws-profile> sh scripts/deploy-live.sh
set -eu
VITE_QUIZ_ENDPOINT=/api/quiz npm run build
cd infra/terraform
B=$(terraform output -raw bucket_name)
aws s3 sync ../../dist/assets "s3://$B/assets" --cache-control "public, max-age=31536000, immutable"
aws s3 sync ../../dist/packs "s3://$B/packs" --delete --cache-control "public, max-age=86400"
aws s3 sync ../../dist "s3://$B" --exclude "assets/*" --exclude "packs/*" --exclude "sw.js" --cache-control "public, max-age=60"
aws s3 cp ../../dist/sw.js "s3://$B/sw.js" --cache-control "no-cache"
aws cloudfront create-invalidation --distribution-id "$(terraform output -raw distribution_id)" --paths "/*"
SITE=$(terraform output -raw site_url)
curl -sSI "$SITE/" | grep -iE "^(HTTP|cache-control|strict-transport)"
curl -sSI "$SITE/atlas" | head -1
curl -sSI "$SITE/sw.js" | grep -i cache-control
curl -s "$SITE/packs/manifest.json" | head -c 200; echo
