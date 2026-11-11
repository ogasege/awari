# The optional quiz service: one Lambda that calls one Bedrock model,
# reachable only through CloudFront. Everything here is count-gated on
# enable_quiz_service.

locals {
  quiz_count     = var.enable_quiz_service ? 1 : 0
  quiz_name      = "${var.project_name}-quiz"
  bedrock_region = coalesce(var.bedrock_region, var.aws_region)
  partition      = data.aws_partition.current.partition
  account_id     = data.aws_caller_identity.current.account_id
  bundle_path    = coalesce(var.quiz_lambda_bundle, "${path.module}/../../services/quiz-lambda/dist/index.mjs")

  # A geo prefix (global., us., eu. ...) marks an inference profile ID.
  model_geo        = try(regex("^(global|us|eu|apac|jp|au|ca)\\.", var.bedrock_model_id)[0], null)
  is_profile       = local.model_geo != null
  base_model_id    = local.is_profile ? join(".", slice(split(".", var.bedrock_model_id), 1, length(split(".", var.bedrock_model_id)))) : var.bedrock_model_id
  foundation_model = "arn:${local.partition}:bedrock:${local.bedrock_region}::foundation-model/${local.base_model_id}"

  # Least privilege: the chosen model only. A cross-region profile may
  # route to the base model in any region of its geography (or, for
  # global profiles, to the region-less ARN).
  bedrock_resources = local.is_profile ? concat(
    [
      "arn:${local.partition}:bedrock:${local.bedrock_region}:${local.account_id}:inference-profile/${var.bedrock_model_id}",
      "arn:${local.partition}:bedrock:*::foundation-model/${local.base_model_id}",
    ],
    local.model_geo == "global" ? ["arn:${local.partition}:bedrock:::foundation-model/${local.base_model_id}"] : [],
  ) : [local.foundation_model]

  quiz_url_host = var.enable_quiz_service ? trimsuffix(trimprefix(aws_lambda_function_url.quiz[0].function_url, "https://"), "/") : null
}

data "archive_file" "quiz" {
  count = local.quiz_count

  type        = "zip"
  source_file = local.bundle_path
  output_path = "${path.module}/../../services/quiz-lambda/dist/quiz-lambda.zip"
}

resource "aws_cloudwatch_log_group" "quiz" {
  count = local.quiz_count

  name              = "/aws/lambda/${local.quiz_name}"
  retention_in_days = var.log_retention_days
}

resource "aws_iam_role" "quiz" {
  count = local.quiz_count

  name = "${local.quiz_name}-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
      Action    = "sts:AssumeRole"
      Condition = {
        StringEquals = { "aws:SourceAccount" = local.account_id }
      }
    }]
  })
}

resource "aws_iam_role_policy" "quiz" {
  count = local.quiz_count

  name = "${local.quiz_name}-policy"
  role = aws_iam_role.quiz[0].id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "WriteOwnLogs"
        Effect   = "Allow"
        Action   = ["logs:CreateLogStream", "logs:PutLogEvents"]
        Resource = "${aws_cloudwatch_log_group.quiz[0].arn}:*"
      },
      {
        Sid      = "InvokeChosenModelOnly"
        Effect   = "Allow"
        Action   = "bedrock:InvokeModel"
        Resource = local.bedrock_resources
      },
    ]
  })
}

resource "aws_lambda_function" "quiz" {
  count = local.quiz_count

  function_name    = local.quiz_name
  description      = "Generates and validates Awari quiz questions with Amazon Bedrock."
  role             = aws_iam_role.quiz[0].arn
  runtime          = "nodejs22.x"
  architectures    = ["arm64"]
  handler          = "index.handler"
  filename         = data.archive_file.quiz[0].output_path
  source_code_hash = data.archive_file.quiz[0].output_base64sha256
  timeout          = var.quiz_timeout_seconds
  memory_size      = var.quiz_memory_mb

  reserved_concurrent_executions = coalesce(var.quiz_reserved_concurrency, -1)

  environment {
    variables = {
      BEDROCK_MODEL_ID = var.bedrock_model_id
      BEDROCK_REGION   = local.bedrock_region
      ALLOWED_ORIGINS  = join(",", concat(local.custom_domain ? ["https://${var.domain_name}"] : [], var.allowed_origins))
    }
  }

  logging_config {
    log_format = "Text"
    log_group  = aws_cloudwatch_log_group.quiz[0].name
  }

  depends_on = [aws_iam_role_policy.quiz]
}

# AWS_IAM auth: only callers with lambda:InvokeFunctionUrl (here, only
# this CloudFront distribution) can reach the function.
resource "aws_lambda_function_url" "quiz" {
  count = local.quiz_count

  function_name      = aws_lambda_function.quiz[0].function_name
  authorization_type = "AWS_IAM"
  invoke_mode        = "BUFFERED"
}

resource "aws_cloudfront_origin_access_control" "quiz" {
  count = local.quiz_count

  name                              = "${local.quiz_name}-url"
  description                       = "Signed CloudFront calls to the Awari quiz function URL."
  origin_access_control_origin_type = "lambda"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

data "aws_cloudfront_origin_request_policy" "all_viewer_except_host" {
  count = local.quiz_count

  name = "Managed-AllViewerExceptHostHeader"
}

resource "aws_lambda_permission" "cloudfront_url" {
  count = local.quiz_count

  statement_id           = "AllowCloudFrontInvokeFunctionUrl"
  action                 = "lambda:InvokeFunctionUrl"
  function_name          = aws_lambda_function.quiz[0].function_name
  principal              = "cloudfront.amazonaws.com"
  source_arn             = aws_cloudfront_distribution.site.arn
  function_url_auth_type = "AWS_IAM"
}

# Function URLs created since October 2025 also need lambda:InvokeFunction
# for the caller; scoped to the same distribution.
resource "aws_lambda_permission" "cloudfront_invoke" {
  count = local.quiz_count

  statement_id  = "AllowCloudFrontInvokeFunction"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.quiz[0].function_name
  principal     = "cloudfront.amazonaws.com"
  source_arn    = aws_cloudfront_distribution.site.arn
}
