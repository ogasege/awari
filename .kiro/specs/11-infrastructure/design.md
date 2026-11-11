# Design: Infrastructure

## Overview

```
student ──HTTPS──▶ CloudFront ─┬─ default, /assets/*, /packs/*, /sw.js ──OAC(s3)──▶ S3 (private)
                               └─ /api/quiz* ──OAC(lambda)──▶ Lambda function URL (AWS_IAM)
                                                                   │
                                                                   ▼
                                                     Bedrock InvokeModel (one model)
```

One root module in `infra/terraform`:

| File | Contents |
| --- | --- |
| `versions.tf` | Terraform ≥ 1.10, `hashicorp/aws ~> 6.0`, `hashicorp/archive ~> 2.7`, provider with default tags |
| `variables.tf` | inputs with validation |
| `site.tf` | bucket, public access block, ownership, encryption, versioning + lifecycle, bucket policy |
| `cdn.tf` | OACs, cache policies, managed policy lookups, distribution |
| `quiz.tf` | zip, log group, role and policy, function, function URL, permissions (all `count`-gated) |
| `outputs.tf` | site URL, bucket, distribution ID, quiz endpoint |
| `tests/*.tftest.hcl` | `terraform test` with mock providers |

### No dependency cycle

The function URL is an origin of the distribution, and the Lambda
permission names the distribution ARN; the permission is a separate
resource, so there is no cycle. The function does **not** receive the
distribution domain in `ALLOWED_ORIGINS` (that would be a cycle): the
app calls `/api/quiz` on its own origin through CloudFront, which needs
no CORS. `allowed_origins` lists extra origins (custom domain, local
dev).

### Caching

| Path | Policy | TTL (min/default/max) |
| --- | --- | --- |
| default (`index.html`, routes) | `awari-html` | 0 / 60 s / 300 s |
| `/assets/*` | `awari-immutable` | 1 day / 1 year / 1 year |
| `/packs/*` | `awari-packs` | 0 / 7 days / 1 year |
| `/sw.js` | Managed-CachingDisabled | none |
| `/api/quiz*` | Managed-CachingDisabled | none |

Browser caching comes from the `Cache-Control` metadata set at upload
(README), matching the table.

### SPA fallback caveat

CloudFront custom error responses apply to the whole distribution. A
missing `/packs/x.json` therefore returns `index.html` with 200, and so
would a 403/404 from the API. The quiz service never returns 403/404,
and both the pack loader and the quiz client must treat non-JSON as a
failure (the client does: it returns `null`).

### Model and IAM

`bedrock_model_id` defaults to `anthropic.claude-haiku-5-5` (Claude
Haiku 5.5). If it starts with a geo prefix (`global.`, `us.`, `eu.`,
`apac.`, `jp.`, `au.`, `ca.`), it is an inference profile: the policy
allows the profile ARN in the Bedrock region and the base model's
foundation-model ARN in any region (plus the region-less ARN for
`global.` profiles), because cross-region inference may route anywhere
in the geography. Otherwise only the foundation-model ARN in the
Bedrock region is allowed.

### Abuse and cost controls

1. Function URL `AWS_IAM` + OAC: only this distribution can invoke it.
2. Reserved concurrency (default 2) caps parallel model calls.
3. Timeout 45 s; at most two model calls of ≤ 4096 output tokens.
4. Request limits in code: 64 KiB body, 40,000-character text.
5. POST only; other methods get 405 before any model call.
6. `enable_quiz_service = false` removes the whole service.
7. Logs kept 14 days; no article text is logged.
8. Recommended outside Terraform: an AWS Budgets alert. WAF rate
   limiting is documented as an option but not created (fixed monthly
   cost).

## Correctness properties

Checked by `terraform test` (mock providers, apply against mocks only,
no AWS) and `terraform validate`.

1. *Private bucket*: all four public-access-block flags are true and
   ownership is `BucketOwnerEnforced`. (Req 1.1)
2. *Bucket policy*: the only Allow grants `s3:GetObject` to
   `cloudfront.amazonaws.com` with an `AWS:SourceArn` condition equal to
   the distribution ARN, and a Deny covers `aws:SecureTransport =
   false`. (Req 1.2)
3. *SPA fallback*: the default root object is `index.html` and both 403
   and 404 map to `/index.html` with 200. (Req 2.2, 2.3)
4. *HTTPS only*: no cache behaviour allows plain HTTP. (Req 2.4)
5. *Cache tiers*: assets and packs policies have default TTLs of at
   least one day, the HTML policy at most five minutes, `/sw.js` uses
   CachingDisabled. (Req 3.1–3.4)
6. *Least privilege*: the Bedrock statement grants exactly
   `bedrock:InvokeModel`, every resource names the chosen base model or
   profile, and no statement uses a `*` action. (Req 5.1–5.3)
7. *Profile IAM*: for a `global.` profile ID the resources include the
   profile ARN and the base foundation-model ARNs. (Req 5.3)
8. *Kill switch*: with `enable_quiz_service = false` there are no
   Lambda, IAM or log resources, no API origin, and `quiz_endpoint` is
   null. (Req 4.1, 6.4)
9. *API wiring*: the function URL uses `AWS_IAM`, the `/api/quiz*`
   behaviour is HTTPS-only with caching disabled, and the permission's
   source ARN is the distribution. (Req 6.1–6.3)
10. *Validation*: an unknown model ID, a timeout above 55 s and a
    non-HTTPS origin are rejected by variable validation. (Req 7.1)
