# Requirements: Infrastructure

## Introduction

Awari is a static site with one optional Lambda. Terraform in
`infra/terraform` describes everything needed to host it on AWS: a
private S3 bucket for the built site, a CloudFront distribution in front
of it, and the quiz service Lambda behind the same distribution. Nothing
is applied without the owner; the code must validate and test offline
with no credentials.

## Glossary

- **Site bucket**: the S3 bucket holding the built `dist/` folder.
- **Distribution**: the CloudFront distribution serving the site.
- **Quiz function**: the Lambda from `services/quiz-lambda`.
- **OAC**: CloudFront origin access control (SigV4-signed origin
  requests).

## Requirements

### Requirement 1: Private site bucket

1. THE Site bucket SHALL block all public access (all four settings)
   and enforce bucket-owner object ownership (no ACLs).
2. THE Site bucket policy SHALL allow `s3:GetObject` only to the
   CloudFront service principal, only for this Distribution (condition
   on `AWS:SourceArn`), and SHALL deny any request not made over TLS.
3. THE Site bucket SHALL encrypt objects at rest and keep versions,
   expiring non-current versions after 30 days.

### Requirement 2: Distribution

1. THE Distribution SHALL read the Site bucket through OAC with SigV4
   signing on every request.
2. THE Distribution SHALL serve `index.html` as the default root object.
3. WHEN the origin answers 403 or 404, THE Distribution SHALL serve
   `/index.html` with status 200, so client-side routes load the app.
4. THE Distribution SHALL never serve content over plain HTTP: site
   behaviours redirect HTTP to HTTPS and the API behaviour accepts HTTPS
   only.
5. THE Distribution SHALL compress responses, enable HTTP/2 and HTTP/3,
   and attach security response headers (HSTS, nosniff, frame options,
   referrer policy).
6. WHERE a custom domain and ACM certificate are supplied, THE
   Distribution SHALL use them with TLS 1.2 or later; otherwise it SHALL
   use the CloudFront default certificate.

### Requirement 3: Cache policies

1. THE Distribution SHALL cache `/assets/*` (content-hashed build files)
   for one year.
2. THE Distribution SHALL cache `/packs/*` for seven days by default
   and at most one year; deploys invalidate the distribution.
3. THE Distribution SHALL cache `index.html` and other app paths for at
   most five minutes (one minute by default).
4. THE Distribution SHALL NOT cache `/sw.js`, so service worker updates
   reach students on their next visit.
5. No site cache key SHALL include cookies, headers or query strings.

### Requirement 4: Quiz function

1. WHERE `enable_quiz_service` is true (the default), THE configuration
   SHALL create the Quiz function from `services/quiz-lambda/dist` on
   the `nodejs22.x` runtime (arm64); WHERE it is false, THE
   configuration SHALL create no Lambda, IAM, log or API resources.
2. THE Quiz function SHALL receive the model ID, Bedrock region and
   allowed origins as environment variables; no secret SHALL appear in
   the configuration.
3. THE Quiz function SHALL have a timeout of at most 55 seconds
   (default 45), and reserved concurrency (default 2) unless the owner
   sets it to null.
4. THE Quiz function's logs SHALL go to a log group created by
   Terraform with a retention period (default 14 days).

### Requirement 5: Least-privilege IAM

1. THE Quiz function role SHALL be assumable only by
   `lambda.amazonaws.com`.
2. THE role SHALL allow `logs:CreateLogStream` and `logs:PutLogEvents`
   only on the function's own log group.
3. THE role SHALL allow `bedrock:InvokeModel` only on the chosen model:
   the foundation-model ARN for a plain model ID, or the inference
   profile ARN plus the foundation-model ARNs it routes to for a
   geo-prefixed profile ID. No wildcard actions SHALL be granted.

### Requirement 6: Quiz API behind CloudFront

1. THE Quiz function SHALL be exposed through a function URL with
   `AWS_IAM` auth, so it cannot be called directly from the internet.
2. THE Distribution SHALL route `/api/quiz*` to the function URL through
   an OAC of type `lambda`, with caching disabled, all viewer headers
   except `Host` forwarded, and a 60-second origin read timeout.
3. THE Lambda resource policy SHALL let only the CloudFront service
   principal, for this Distribution only, invoke the function.
4. WHERE `enable_quiz_service` is false, THE Distribution SHALL have no
   API origin or behaviour.

### Requirement 7: Usability and checks

1. Every input SHALL be a variable with a description, a type, a safe
   default where one exists, and validation where a wrong value would
   fail late (model ID, price class, timeouts, retention, origins).
2. THE configuration SHALL output the site URL, bucket name,
   distribution ID and quiz endpoint (null when disabled).
3. THE folder SHALL include `example.tfvars` and a README with the exact
   build, deploy, upload, invalidate and verify commands, and the abuse
   and cost controls.
4. `terraform fmt -check`, `terraform validate` and `terraform test`
   (mock providers, no credentials, no AWS calls) SHALL pass.
