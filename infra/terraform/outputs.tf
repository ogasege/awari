# What a deploy needs next: where to upload, what to invalidate, and the
# URLs to check.

output "site_url" {
  description = "Public HTTPS URL of the site."
  value       = "https://${local.custom_domain ? var.domain_name : aws_cloudfront_distribution.site.domain_name}"
}

output "bucket_name" {
  description = "Bucket to upload the built dist/ folder to."
  value       = aws_s3_bucket.site.bucket
}

output "distribution_id" {
  description = "CloudFront distribution ID, for cache invalidations."
  value       = aws_cloudfront_distribution.site.id
}

output "distribution_domain_name" {
  description = "CloudFront domain (point a custom domain's CNAME or alias here)."
  value       = aws_cloudfront_distribution.site.domain_name
}

output "quiz_endpoint" {
  description = "Quiz API endpoint through CloudFront, or null when the service is disabled."
  value       = var.enable_quiz_service ? "https://${local.custom_domain ? var.domain_name : aws_cloudfront_distribution.site.domain_name}/api/quiz" : null
}

output "quiz_function_name" {
  description = "Quiz Lambda name (for logs), or null when disabled."
  value       = var.enable_quiz_service ? aws_lambda_function.quiz[0].function_name : null
}

output "quiz_function_url" {
  description = "Direct function URL (IAM-only; a plain request must get 403). Null when disabled."
  value       = var.enable_quiz_service ? aws_lambda_function_url.quiz[0].function_url : null
}
