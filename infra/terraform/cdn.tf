# CloudFront in front of the private bucket and (optionally) the quiz
# Lambda. HTTPS only, SPA fallback, and cache tiers matched to how each
# path changes.

locals {
  s3_origin_id   = "site-bucket"
  quiz_origin_id = "quiz-lambda"
  custom_domain  = var.domain_name != null && var.acm_certificate_arn != null
}

resource "aws_cloudfront_origin_access_control" "site" {
  name                              = "${var.project_name}-site"
  description                       = "Signed CloudFront reads from the Awari site bucket."
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# Managed policies, looked up by name rather than hard-coded IDs.
data "aws_cloudfront_cache_policy" "disabled" {
  name = "Managed-CachingDisabled"
}

data "aws_cloudfront_response_headers_policy" "security" {
  name = "Managed-SecurityHeadersPolicy"
}

# Content-hashed build output: safe to keep for a year.
resource "aws_cloudfront_cache_policy" "immutable" {
  name        = "${var.project_name}-immutable"
  comment     = "Content-hashed files under /assets/."
  min_ttl     = 86400
  default_ttl = 31536000
  max_ttl     = 31536000

  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true

    cookies_config {
      cookie_behavior = "none"
    }
    headers_config {
      header_behavior = "none"
    }
    query_strings_config {
      query_string_behavior = "none"
    }
  }
}

# Content packs change only on deploy, and deploys invalidate.
resource "aws_cloudfront_cache_policy" "packs" {
  name        = "${var.project_name}-packs"
  comment     = "Content packs under /packs/."
  min_ttl     = 0
  default_ttl = 604800
  max_ttl     = 31536000

  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true

    cookies_config {
      cookie_behavior = "none"
    }
    headers_config {
      header_behavior = "none"
    }
    query_strings_config {
      query_string_behavior = "none"
    }
  }
}

# index.html and client-side routes: short, so a deploy shows quickly.
resource "aws_cloudfront_cache_policy" "html" {
  name        = "${var.project_name}-html"
  comment     = "index.html and app routes."
  min_ttl     = 0
  default_ttl = 60
  max_ttl     = 300

  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true

    cookies_config {
      cookie_behavior = "none"
    }
    headers_config {
      header_behavior = "none"
    }
    query_strings_config {
      query_string_behavior = "none"
    }
  }
}

locals {
  # Path patterns served from the bucket with their cache policies.
  site_behaviors = [
    { path = "/assets/*", cache_policy_id = aws_cloudfront_cache_policy.immutable.id },
    { path = "/packs/*", cache_policy_id = aws_cloudfront_cache_policy.packs.id },
    { path = "/sw.js", cache_policy_id = data.aws_cloudfront_cache_policy.disabled.id },
  ]
}

resource "aws_cloudfront_distribution" "site" {
  enabled             = true
  comment             = "Awari: free offline-first encyclopedia"
  default_root_object = "index.html"
  http_version        = "http2and3"
  is_ipv6_enabled     = true
  price_class         = var.price_class
  aliases             = local.custom_domain ? [var.domain_name] : []

  origin {
    origin_id                = local.s3_origin_id
    domain_name              = aws_s3_bucket.site.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.site.id
  }

  dynamic "origin" {
    for_each = var.enable_quiz_service ? [1] : []

    content {
      origin_id                = local.quiz_origin_id
      domain_name              = local.quiz_url_host
      origin_access_control_id = aws_cloudfront_origin_access_control.quiz[0].id

      custom_origin_config {
        http_port              = 80
        https_port             = 443
        origin_protocol_policy = "https-only"
        origin_ssl_protocols   = ["TLSv1.2"]
        origin_read_timeout    = 60
      }
    }
  }

  default_cache_behavior {
    target_origin_id           = local.s3_origin_id
    viewer_protocol_policy     = "redirect-to-https"
    allowed_methods            = ["GET", "HEAD", "OPTIONS"]
    cached_methods             = ["GET", "HEAD"]
    compress                   = true
    cache_policy_id            = aws_cloudfront_cache_policy.html.id
    response_headers_policy_id = data.aws_cloudfront_response_headers_policy.security.id
  }

  dynamic "ordered_cache_behavior" {
    for_each = var.enable_quiz_service ? [1] : []

    content {
      path_pattern               = "/api/quiz*"
      target_origin_id           = local.quiz_origin_id
      viewer_protocol_policy     = "https-only"
      allowed_methods            = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
      cached_methods             = ["GET", "HEAD"]
      compress                   = true
      cache_policy_id            = data.aws_cloudfront_cache_policy.disabled.id
      origin_request_policy_id   = data.aws_cloudfront_origin_request_policy.all_viewer_except_host[0].id
      response_headers_policy_id = data.aws_cloudfront_response_headers_policy.security.id
    }
  }

  dynamic "ordered_cache_behavior" {
    for_each = local.site_behaviors

    content {
      path_pattern               = ordered_cache_behavior.value.path
      target_origin_id           = local.s3_origin_id
      viewer_protocol_policy     = "redirect-to-https"
      allowed_methods            = ["GET", "HEAD", "OPTIONS"]
      cached_methods             = ["GET", "HEAD"]
      compress                   = true
      cache_policy_id            = ordered_cache_behavior.value.cache_policy_id
      response_headers_policy_id = data.aws_cloudfront_response_headers_policy.security.id
    }
  }

  # SPA fallback: unknown paths load the app, which routes client-side.
  # S3 answers 403 for missing keys because CloudFront has no ListBucket.
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = local.custom_domain ? null : true
    acm_certificate_arn            = local.custom_domain ? var.acm_certificate_arn : null
    ssl_support_method             = local.custom_domain ? "sni-only" : null
    minimum_protocol_version       = local.custom_domain ? "TLSv1.2_2021" : null
  }
}
