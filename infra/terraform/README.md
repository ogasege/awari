# Awari infrastructure (Terraform)

Everything Awari needs on AWS, with no servers:

- **S3** (private): holds the built site (`dist/`). Public access is
  blocked; only this CloudFront distribution can read it, only over TLS.
- **CloudFront**: HTTPS only, HTTP/2 and HTTP/3, security headers, SPA
  fallback (403/404 serve `/index.html` with 200), and cache tiers:

  | Path | Edge cache | Upload `Cache-Control` |
  | --- | --- | --- |
  | `/assets/*` | 1 year | `public, max-age=31536000, immutable` |
  | `/packs/*` | 7 days (deploys invalidate) | `public, max-age=86400` |
  | `/sw.js` | never | `no-cache` |
  | everything else (`index.html`, routes) | 60 s (max 5 min) | `public, max-age=60` |

- **Quiz service** (optional, `enable_quiz_service`): one Lambda
  (Node.js 22, arm64) that asks Claude Haiku on Amazon Bedrock for quiz
  questions and validates each against the article. Exposed only as
  `/api/quiz` on the same CloudFront domain, through a function URL with
  `AWS_IAM` auth and a Lambda origin access control.

Spec: `.kiro/specs/11-infrastructure/`. Nothing here contains
credentials; Terraform uses your normal AWS profile or SSO session.

## Prerequisites

- Terraform 1.10 or later, AWS CLI v2, Node.js 22, `jq`.
- An AWS account and a profile with rights to create S3, CloudFront,
  Lambda, IAM and CloudWatch Logs resources.
- For the quiz service: Claude Haiku 4.5 (US inference profile) available to your account in
  `aws_region` (see step 2).

## Deploy

Run from the repository root unless a step says otherwise.

```sh
# 1. Build the site and the quiz Lambda bundle.
npm ci && npm run build
(cd services/quiz-lambda && npm ci && npm run check)   # typecheck, test, build

# 2. Check the model is offered in your region (no cost).
aws bedrock list-foundation-models --region us-east-1 --by-provider anthropic \
  --query "modelSummaries[].modelId" --output text | tr '\t' '\n' | grep haiku
aws bedrock list-inference-profiles --region us-east-1 \
  --query "inferenceProfileSummaries[].inferenceProfileId" --output text | tr '\t' '\n' | grep haiku
# Anthropic models may ask for a one-time use-case form in the Bedrock
# console (Model catalog > Claude Haiku 4.5) before the first call.

# 3. Configure.
cd infra/terraform
cp example.tfvars terraform.tfvars   # edit; terraform.tfvars is git-ignored

# 4. Create the stack (review the plan before applying).
terraform init
terraform plan -out tfplan
terraform apply tfplan

# 5. Upload the site with the right cache headers.
SITE_BUCKET=$(terraform output -raw bucket_name)
aws s3 sync ../../dist/assets "s3://$SITE_BUCKET/assets" \
  --cache-control "public, max-age=31536000, immutable"
aws s3 sync ../../dist/packs "s3://$SITE_BUCKET/packs" --delete \
  --cache-control "public, max-age=86400"
aws s3 sync ../../dist "s3://$SITE_BUCKET" \
  --exclude "assets/*" --exclude "packs/*" --exclude "sw.js" \
  --cache-control "public, max-age=60"
aws s3 cp ../../dist/sw.js "s3://$SITE_BUCKET/sw.js" --cache-control "no-cache"

# 6. Make the new version visible everywhere.
aws cloudfront create-invalidation \
  --distribution-id "$(terraform output -raw distribution_id)" --paths "/*"
```

Old files under `assets/` are kept on purpose: a browser holding the
previous `index.html` for up to a minute can still load its scripts.

The first CloudFront deployment takes a few minutes; `terraform apply`
waits for it.

## Verify

```sh
cd infra/terraform
SITE=$(terraform output -raw site_url)

# Site, HTTPS redirect, SPA fallback and cache headers.
curl -sSI "$SITE/" | grep -iE "^(HTTP|cache-control|strict-transport)"
curl -sSI "http://${SITE#https://}/" | grep -iE "^(HTTP|location)"   # 301 to https
curl -sSI "$SITE/atlas" | head -1                                     # 200 (index.html)
curl -sSI "$SITE/sw.js" | grep -iE "^(cache-control|x-cache)"

# The function URL refuses direct calls (expect 403).
curl -s -o /dev/null -w "%{http_code}\n" -X POST "$(terraform output -raw quiz_function_url)"

# Quiz service through CloudFront (one Bedrock call costs a fraction of a cent).
curl -s "https://simple.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&format=json&formatversion=2&titles=Ghana" \
  | jq -r '.query.pages[0].extract' | head -c 39000 > /tmp/ghana.txt
jq -n --arg title Ghana --rawfile text /tmp/ghana.txt '{title: $title, text: $text}' > /tmp/quiz.json
curl -sS -X POST "$(terraform output -raw quiz_endpoint)" \
  -H "content-type: application/json" \
  -H "x-amz-content-sha256: $(shasum -a 256 /tmp/quiz.json | cut -d' ' -f1)" \
  --data-binary @/tmp/quiz.json | jq '{rejected, count: (.questions | length), first: .questions[0].prompt}'

# Logs (counts and timings only; article text is never logged).
aws logs tail "/aws/lambda/$(terraform output -raw quiz_function_name)" --since 10m
```

The `x-amz-content-sha256` header is required: CloudFront signs requests
to the Lambda function URL and needs the hash of POST bodies. The app's
client (`src/lib/quiz/remote.ts`) sends it automatically.

If the quiz call returns 502 and the logs show `ValidationException`
for the model, your region may not serve Claude Haiku 4.5 through the
Converse API. Set
`bedrock_model_id = "global.anthropic.claude-haiku-4-5-20251001-v1:0"`
in `terraform.tfvars` and apply again; the IAM policy follows the ID.

## Abuse and cost controls

| Control | Where | Effect |
| --- | --- | --- |
| Function URL `AWS_IAM` + Lambda OAC | `quiz.tf` | Only this distribution can invoke the function; direct calls get 403. |
| Reserved concurrency 2 | `quiz_reserved_concurrency` | At most two generations run at once, capping Bedrock spend per minute. |
| Timeout 45 s | `quiz_timeout_seconds` | Bounds Lambda time per request (CloudFront waits up to 60 s). |
| Two model calls max, 4,096 output tokens each | Lambda code | Worst case per request is bounded and small. |
| 64 KiB body, 200–40,000-character text, POST only | Lambda code | Large or odd requests are refused before any model call. |
| No URL fetching | Lambda code | No server-side request forgery surface. |
| `bedrock:InvokeModel` on one model only | `quiz.tf` | A leaked role cannot call other, pricier models. |
| 14-day log retention | `log_retention_days` | Logs do not pile up. |
| Kill switch | `enable_quiz_service = false` | Removes the Lambda, IAM role, logs and `/api/quiz` route. The app keeps working. |

Not created by Terraform, recommended for the owner:

- An **AWS Budgets** alert (for example 5 USD a month) on the account.
- **AWS WAF** with a rate-based rule on `/api/quiz*` if abuse appears.
  It is left out because a web ACL has a fixed monthly charge.

New AWS accounts often have a Lambda concurrency limit of 10, and AWS
keeps 10 unreserved, so reserving any concurrency fails. Set
`quiz_reserved_concurrency = null` there; the timeout and per-request
limits still apply.

## Known caveat: SPA fallback

CloudFront's custom error responses cover the whole distribution, so a
missing `/packs/x.json` comes back as `index.html` with status 200. Code
that loads packs must treat a non-JSON body as "not found". The quiz
service never answers 403 or 404 for the same reason.

## Tests (offline)

```sh
cd infra/terraform
terraform fmt -check -recursive
terraform init -backend=false
terraform validate
terraform test     # mock providers: no credentials, no AWS calls
```

`tests/*.tftest.hcl` check the correctness properties in
`.kiro/specs/11-infrastructure/design.md`: private bucket, CloudFront-only
bucket policy, SPA fallback, HTTPS only, cache tiers, least-privilege
IAM for model IDs and inference profiles, the kill switch, the API
wiring, and variable validation.

## Tear down

The bucket is versioned, so empty it first: in the S3 console, select
the bucket and choose **Empty** (this removes every version and delete
marker). Then:

```sh
terraform destroy
```

Keep the stack running until at least 29 January 2027 (hackathon rule).
