# 11-infrastructure review: Terraform MCP and AWS documentation MCP

Date: 2026-11-12. No `.tf` file was changed. Nothing was planned or applied.

## MCP tool calls

| # | Server | Tool | Returned (one line) |
|---|--------|------|---------------------|
| 1 | terraform | `get_latest_provider_version` (hashicorp/aws) | `6.73.0` |
| 2 | terraform | `search_provider_docs` (aws, `lambda_function_url`, 6.73.0) | doc ID 14784882 |
| 3 | terraform | `search_provider_docs` (aws, `lambda_permission`, 6.73.0) | doc ID 14784886 |
| 4 | terraform | `search_provider_docs` (aws, `cloudfront_origin_access_control`, 6.73.0) | doc ID 14784237 |
| 5 | terraform | `get_provider_details` (14784882) | `aws_lambda_function_url` arguments, `AWS_IAM` / `NONE`, `invoke_mode`, `function_url` attribute |
| 6 | terraform | `get_provider_details` (14784886) | `aws_lambda_permission` arguments incl. `function_url_auth_type` and `invoked_via_function_url` |
| 7 | terraform | `get_provider_details` (14784237) | `aws_cloudfront_origin_access_control` arguments; `lambda` is a valid origin type |
| 8 | aws-documentation | `search_documentation` ("Restrict access to an AWS Lambda function URL origin") | Found `private-content-restricting-access-to-lambda.html` (and a separate Lambda *Web Function* page) |
| 9 | aws-documentation | `read_documentation` (that page, chars 0 to 14000) | Prerequisites, permission CLI commands, OAC settings, signing behaviours |
| 10 | aws-documentation | `read_documentation` (same page, from 14000) | Python POST example that sets `x-amz-content-sha256` |

Version note: `versions.tf` pins `~> 6.0`, not an exact version. The lock file
(`.terraform.lock.hcl`) resolves to 6.72.0. The docs were fetched for 6.73.0
(latest in the 6.x range); 6.72.0 docs were not fetched separately.

## What the docs require

CloudFront guide, "Restrict access to an AWS Lambda function URL origin":

- Function URL auth: "To use OAC, you must specify `AWS_IAM` as the value for the `AuthType` parameter."
- OAC: origin type `lambda`, `SigningBehavior: always`, `SigningProtocol: sigv4`. Always is the "recommended setting".
- Origin protocol: "Select **HTTPS only** for your origin's **Protocol**."
- Permissions, both with principal `cloudfront.amazonaws.com` and `--source-arn` the distribution ARN:
  - `lambda:InvokeFunctionUrl`
  - `lambda:InvokeFunction`
- Order: grant permission "after you create a CloudFront distribution, but before you add the OAC".
- "If you use `PUT` or `POST` methods ... your users must compute the SHA256 of the body and include the payload hash value ... in the `x-amz-content-sha256` header ... Lambda doesn't support unsigned payloads."
- `no-override`: signature must be for the Lambda URL host, and `Authorization` must be in the cache policy. Not used here.
- `never`: needs a publicly accessible URL. Not used here.

Provider docs (6.73.0):

- `aws_lambda_function_url`: `authorization_type` required (`AWS_IAM` or `NONE`); `invoke_mode` `BUFFERED` is the default.
- `aws_lambda_permission`: "`function_url_auth_type` ... Valid values: `AWS_IAM` or `NONE`. Only valid with `lambda:InvokeFunctionUrl` action". "`invoked_via_function_url` ... Only valid with `lambda:InvokeFunction` action".
- `aws_cloudfront_origin_access_control`: `origin_access_control_origin_type` valid values `lambda`, `mediapackagev2`, `mediastore`, `s3`. `signing_behavior`: `always`, `always-amz-auth`, `never`, `no-override`. `always-amz-auth` is "supported only for Lambda Web Function origins".

## Comparison with the code

| Requirement | File and setting | Result |
|-------------|------------------|--------|
| Function URL `AWS_IAM` | `quiz.tf` `aws_lambda_function_url.quiz`: `authorization_type = "AWS_IAM"` | Match |
| `invoke_mode` valid | `quiz.tf`: `BUFFERED` | Match |
| OAC type `lambda` | `quiz.tf` `aws_cloudfront_origin_access_control.quiz` | Match |
| Signing `always` / `sigv4` | same resource | Match (not `always-amz-auth`, which is Web Function only) |
| HTTPS only to origin | `cdn.tf` `custom_origin_config.origin_protocol_policy = "https-only"` | Match |
| OAC attached to the Lambda origin | `cdn.tf` origin `origin_access_control_id = ...quiz[0].id` | Match |
| `lambda:InvokeFunctionUrl` for CloudFront, scoped to the distribution | `quiz.tf` `cloudfront_url`: principal `cloudfront.amazonaws.com`, `source_arn` = `aws_cloudfront_distribution.site.arn`, `function_url_auth_type = "AWS_IAM"` | Match |
| `lambda:InvokeFunction` for CloudFront, scoped to the distribution | `quiz.tf` `cloudfront_invoke` | Match |
| POST body hash header | Not Terraform: `src/lib/quiz/remote.ts` sends `x-amz-content-sha256` (tested in `remote.test.ts`); `cors.ts` allows the header | Match |
| Provider constraint | `versions.tf` `~> 6.0`, lock at 6.72.0 | Match; resource arguments used exist in 6.73.0 docs |

No required setting is missing or wrong.

## Observations (not mismatches)

1. `invoked_via_function_url` is not set on `cloudfront_invoke`. The CloudFront
   page's CLI example does not set it either, so this follows the docs. The
   provider offers it as an extra restriction. Setting it is optional hardening;
   it was not verified here that CloudFront's call is accepted with it.
2. The comment in `quiz.tf` says the `lambda:InvokeFunction` permission is
   needed for function URLs "created since October 2025". The CloudFront page
   says only that both permissions are required, with no date. The date claim
   is not confirmed by the pages read; consider rewording the comment.
3. `AllViewerExceptHostHeader` origin request policy (`quiz.tf`, `cdn.tf`) is
   not mentioned on the page read. It fits the page's statement that the
   signature is validated against the Lambda URL host, but the page does not
   name the policy.
4. The permission-before-OAC ordering is satisfied only loosely: `cloudfront_url`
   depends on the distribution ARN, and the distribution depends on the OAC.
   Terraform cannot add the permission before the OAC is attached, because the
   permission needs the distribution ARN. The docs' order is a console and CLI
   workflow; the guide mentions a possible transient 403 while the distribution
   deploys (Web Function page), so expect brief 403s on first deploy.
5. The provider resource page for `aws_cloudfront_origin_access_control` opens
   with S3 wording, but its argument list lists `lambda` as valid.
