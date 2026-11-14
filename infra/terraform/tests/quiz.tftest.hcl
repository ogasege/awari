# Properties 6-10 of .kiro/specs/11-infrastructure/design.md, checked
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
  mock_resource "aws_cloudfront_distribution" {
    defaults = {
      arn         = "arn:aws:cloudfront::123456789012:distribution/EDFDVBD6EXAMPLE"
      domain_name = "d111111abcdef8.cloudfront.net"
    }
  }
  mock_resource "aws_cloudwatch_log_group" {
    defaults = {
      arn = "arn:aws:logs:us-east-1:123456789012:log-group:/aws/lambda/awari-quiz"
    }
  }
  mock_resource "aws_iam_role" {
    defaults = { arn = "arn:aws:iam::123456789012:role/awari-quiz-role" }
  }
  mock_resource "aws_lambda_function_url" {
    defaults = { function_url = "https://abc123.lambda-url.us-east-1.on.aws/" }
  }
}

mock_provider "archive" {}

run "least_privilege_default_model" {
  command = apply

  # Pinned so a local terraform.tfvars (which terraform test loads) cannot change the defaults.
  variables {
    bedrock_model_id          = "us.anthropic.claude-haiku-4-5-20251001-v1:0"
    quiz_reserved_concurrency = 2
  }

  # Property 6 (Req 5.1-5.3)
  assert {
    condition = one([
      for s in jsondecode(aws_iam_role_policy.quiz[0].policy).Statement : s.Resource
      if s.Action == "bedrock:InvokeModel"
    ]) == [
      "arn:aws:bedrock:us-east-1:123456789012:inference-profile/us.anthropic.claude-haiku-4-5-20251001-v1:0",
      "arn:aws:bedrock:*::foundation-model/anthropic.claude-haiku-4-5-20251001-v1:0",
    ]
    error_message = "Property 6: Bedrock access must name only the chosen model."
  }
  assert {
    condition = alltrue(flatten([
      for s in jsondecode(aws_iam_role_policy.quiz[0].policy).Statement : [
        for a in flatten([s.Action]) : !strcontains(a, "*")
      ]
    ]))
    error_message = "Property 6: no wildcard actions."
  }
  assert {
    condition = one([
      for s in jsondecode(aws_iam_role_policy.quiz[0].policy).Statement : s.Resource
      if s.Sid == "WriteOwnLogs"
    ]) == "${aws_cloudwatch_log_group.quiz[0].arn}:*"
    error_message = "Req 5.2: logs only to the function's own log group."
  }
  assert {
    condition     = jsondecode(aws_iam_role.quiz[0].assume_role_policy).Statement[0].Principal.Service == "lambda.amazonaws.com"
    error_message = "Req 5.1: only Lambda may assume the role."
  }

  # Req 4.1-4.4
  assert {
    condition     = aws_lambda_function.quiz[0].runtime == "nodejs22.x" && aws_lambda_function.quiz[0].timeout <= 55
    error_message = "Req 4.1/4.3: Node 22 runtime and a timeout under 55 s."
  }
  assert {
    condition     = aws_lambda_function.quiz[0].reserved_concurrent_executions == 2
    error_message = "Req 4.3: reserved concurrency defaults to 2."
  }
  assert {
    condition     = aws_cloudwatch_log_group.quiz[0].retention_in_days == 14
    error_message = "Req 4.4: logs are kept 14 days."
  }
  assert {
    condition     = aws_lambda_function.quiz[0].environment[0].variables.BEDROCK_MODEL_ID == "us.anthropic.claude-haiku-4-5-20251001-v1:0"
    error_message = "Req 4.2: the model ID reaches the function."
  }
}

run "api_wiring" {
  command = apply

  # Property 9 (Req 6.1-6.3)
  assert {
    condition     = aws_lambda_function_url.quiz[0].authorization_type == "AWS_IAM"
    error_message = "Property 9: the function URL must require IAM auth."
  }
  assert {
    condition     = aws_cloudfront_origin_access_control.quiz[0].origin_access_control_origin_type == "lambda"
    error_message = "Property 9: CloudFront must sign requests to the function URL."
  }
  assert {
    condition = one([
      for b in aws_cloudfront_distribution.site.ordered_cache_behavior :
      b.viewer_protocol_policy == "https-only" && b.cache_policy_id == data.aws_cloudfront_cache_policy.disabled.id
      if b.path_pattern == "/api/quiz*"
    ])
    error_message = "Property 9: /api/quiz* must be HTTPS-only and uncached."
  }
  assert {
    condition = one([
      for o in aws_cloudfront_distribution.site.origin : o.domain_name
      if o.origin_id == "quiz-lambda"
    ]) == "abc123.lambda-url.us-east-1.on.aws"
    error_message = "Property 9: the API origin is the function URL host."
  }
  assert {
    condition = alltrue([
      for p in [aws_lambda_permission.cloudfront_url[0], aws_lambda_permission.cloudfront_invoke[0]] :
      p.principal == "cloudfront.amazonaws.com" && p.source_arn == aws_cloudfront_distribution.site.arn
    ])
    error_message = "Property 9: only this distribution may invoke the function."
  }
  assert {
    condition     = output.quiz_endpoint == "https://d111111abcdef8.cloudfront.net/api/quiz"
    error_message = "Req 7.2: quiz_endpoint goes through CloudFront."
  }
}

run "global_inference_profile" {
  command = apply

  variables {
    bedrock_model_id = "global.anthropic.claude-haiku-4-5-20251001-v1:0"
  }

  # Property 7 (Req 5.3)
  assert {
    condition = toset(one([
      for s in jsondecode(aws_iam_role_policy.quiz[0].policy).Statement : s.Resource
      if s.Action == "bedrock:InvokeModel"
      ])) == toset([
      "arn:aws:bedrock:us-east-1:123456789012:inference-profile/global.anthropic.claude-haiku-4-5-20251001-v1:0",
      "arn:aws:bedrock:*::foundation-model/anthropic.claude-haiku-4-5-20251001-v1:0",
      "arn:aws:bedrock:::foundation-model/anthropic.claude-haiku-4-5-20251001-v1:0",
    ])
    error_message = "Property 7: a global profile grants the profile and its base model only."
  }
}

run "regional_inference_profile" {
  command = apply

  variables {
    bedrock_model_id = "eu.anthropic.claude-haiku-4-5-20251001-v1:0"
    aws_region       = "eu-west-1"
  }

  assert {
    condition = toset(one([
      for s in jsondecode(aws_iam_role_policy.quiz[0].policy).Statement : s.Resource
      if s.Action == "bedrock:InvokeModel"
      ])) == toset([
      "arn:aws:bedrock:eu-west-1:123456789012:inference-profile/eu.anthropic.claude-haiku-4-5-20251001-v1:0",
      "arn:aws:bedrock:*::foundation-model/anthropic.claude-haiku-4-5-20251001-v1:0",
    ])
    error_message = "Property 7: a regional profile has no region-less ARN."
  }
}

run "unreserved_concurrency" {
  command = apply

  variables {
    quiz_reserved_concurrency = null
  }

  assert {
    condition     = aws_lambda_function.quiz[0].reserved_concurrent_executions == -1
    error_message = "Req 4.3: null leaves concurrency unreserved."
  }
}

run "kill_switch" {
  command = apply

  variables {
    enable_quiz_service = false
  }

  # Property 8 (Req 4.1, 6.4)
  assert {
    condition = (
      length(aws_lambda_function.quiz) + length(aws_iam_role.quiz) +
      length(aws_cloudwatch_log_group.quiz) + length(aws_lambda_function_url.quiz) +
      length(aws_lambda_permission.cloudfront_url) == 0
    )
    error_message = "Property 8: no quiz resources when disabled."
  }
  assert {
    condition     = length(aws_cloudfront_distribution.site.origin) == 1
    error_message = "Property 8: no API origin when disabled."
  }
  assert {
    condition     = output.quiz_endpoint == null
    error_message = "Property 8: quiz_endpoint is null when disabled."
  }
}

# Property 10 (Req 7.1): bad inputs fail at plan time.
run "rejects_unknown_model" {
  command = plan

  variables {
    bedrock_model_id = "meta.llama3-70b-instruct-v1:0"
  }

  expect_failures = [var.bedrock_model_id]
}

run "rejects_long_timeout" {
  command = plan

  variables {
    quiz_timeout_seconds = 90
  }

  expect_failures = [var.quiz_timeout_seconds]
}

run "rejects_plain_http_origin" {
  command = plan

  variables {
    allowed_origins = ["http://evil.example"]
  }

  expect_failures = [var.allowed_origins]
}
