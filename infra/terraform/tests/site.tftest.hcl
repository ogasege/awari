# Properties 1-5 of .kiro/specs/11-infrastructure/design.md, checked
# against mock providers: no credentials, no AWS calls.

mock_provider "aws" {
  mock_data "aws_caller_identity" {
    defaults = { account_id = "123456789012" }
  }
  mock_data "aws_partition" {
    defaults = { partition = "aws" }
  }
  mock_data "aws_cloudfront_cache_policy" {
    defaults = { id = "managed-caching-disabled" }
  }
  mock_resource "aws_s3_bucket" {
    defaults = {
      arn                         = "arn:aws:s3:::awari-site-test"
      bucket                      = "awari-site-test"
      bucket_regional_domain_name = "awari-site-test.s3.us-east-1.amazonaws.com"
    }
  }
  mock_resource "aws_cloudfront_distribution" {
    defaults = {
      arn         = "arn:aws:cloudfront::123456789012:distribution/EDFDVBD6EXAMPLE"
      domain_name = "d111111abcdef8.cloudfront.net"
    }
  }
}

mock_provider "archive" {}

variables {
  enable_quiz_service = false
}

run "private_bucket" {
  command = apply

  # Property 1 (Req 1.1)
  assert {
    condition = alltrue([
      aws_s3_bucket_public_access_block.site.block_public_acls,
      aws_s3_bucket_public_access_block.site.block_public_policy,
      aws_s3_bucket_public_access_block.site.ignore_public_acls,
      aws_s3_bucket_public_access_block.site.restrict_public_buckets,
    ])
    error_message = "Property 1: every public access block flag must be true."
  }
  assert {
    condition     = aws_s3_bucket_ownership_controls.site.rule[0].object_ownership == "BucketOwnerEnforced"
    error_message = "Property 1: ACLs must be disabled (BucketOwnerEnforced)."
  }
}

run "bucket_policy" {
  command = apply

  # Property 2 (Req 1.2)
  assert {
    condition = length([
      for s in jsondecode(aws_s3_bucket_policy.site.policy).Statement : s if s.Effect == "Allow"
    ]) == 1
    error_message = "Property 2: the bucket policy must have exactly one Allow."
  }
  assert {
    condition = alltrue([
      for s in jsondecode(aws_s3_bucket_policy.site.policy).Statement :
      s.Principal == { Service = "cloudfront.amazonaws.com" } &&
      s.Action == "s3:GetObject" &&
      s.Condition.StringEquals["AWS:SourceArn"] == aws_cloudfront_distribution.site.arn
      if s.Effect == "Allow"
    ])
    error_message = "Property 2: only this distribution may read objects."
  }
  assert {
    condition = anytrue([
      for s in jsondecode(aws_s3_bucket_policy.site.policy).Statement :
      s.Effect == "Deny" && try(s.Condition.Bool["aws:SecureTransport"], null) == "false"
    ])
    error_message = "Property 2: requests without TLS must be denied."
  }
  assert {
    condition     = aws_cloudfront_origin_access_control.site.signing_behavior == "always" && aws_cloudfront_origin_access_control.site.signing_protocol == "sigv4"
    error_message = "Req 2.1: the bucket must be read through a SigV4 OAC."
  }
}

run "spa_fallback_and_https" {
  command = apply

  # Property 3 (Req 2.2, 2.3)
  assert {
    condition     = aws_cloudfront_distribution.site.default_root_object == "index.html"
    error_message = "Property 3: default root object must be index.html."
  }
  assert {
    condition = toset([
      for e in aws_cloudfront_distribution.site.custom_error_response : e.error_code
      if e.response_code == 200 && e.response_page_path == "/index.html"
    ]) == toset([403, 404])
    error_message = "Property 3: 403 and 404 must serve /index.html with 200."
  }

  # Property 4 (Req 2.4)
  assert {
    condition = alltrue(concat(
      [for b in aws_cloudfront_distribution.site.default_cache_behavior : b.viewer_protocol_policy != "allow-all"],
      [for b in aws_cloudfront_distribution.site.ordered_cache_behavior : b.viewer_protocol_policy != "allow-all"],
    ))
    error_message = "Property 4: no behaviour may allow plain HTTP."
  }
  assert {
    condition     = aws_cloudfront_distribution.site.http_version == "http2and3"
    error_message = "Req 2.5: HTTP/2 and HTTP/3 must be enabled."
  }
}

run "cache_tiers" {
  command = apply

  # Property 5 (Req 3.1-3.5)
  assert {
    condition     = aws_cloudfront_cache_policy.immutable.default_ttl >= 31536000 && aws_cloudfront_cache_policy.packs.default_ttl >= 86400
    error_message = "Property 5: assets must cache for a year and packs for at least a day."
  }
  assert {
    condition     = aws_cloudfront_cache_policy.html.max_ttl <= 300
    error_message = "Property 5: index.html must cache for at most five minutes."
  }
  assert {
    condition = one([
      for b in aws_cloudfront_distribution.site.ordered_cache_behavior : b.cache_policy_id
      if b.path_pattern == "/sw.js"
    ]) == data.aws_cloudfront_cache_policy.disabled.id
    error_message = "Property 5: /sw.js must not be cached."
  }
  assert {
    condition = alltrue([
      for p in [aws_cloudfront_cache_policy.immutable, aws_cloudfront_cache_policy.packs, aws_cloudfront_cache_policy.html] :
      p.parameters_in_cache_key_and_forwarded_to_origin[0].cookies_config[0].cookie_behavior == "none" &&
      p.parameters_in_cache_key_and_forwarded_to_origin[0].headers_config[0].header_behavior == "none" &&
      p.parameters_in_cache_key_and_forwarded_to_origin[0].query_strings_config[0].query_string_behavior == "none"
    ])
    error_message = "Req 3.5: site cache keys must not include cookies, headers or query strings."
  }
  assert {
    condition = toset([
      for b in aws_cloudfront_distribution.site.ordered_cache_behavior : b.path_pattern
    ]) == toset(["/assets/*", "/packs/*", "/sw.js"])
    error_message = "Without the quiz service, only the three site behaviours exist."
  }
}
