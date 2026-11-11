# Inputs for the Awari stack. Every value has a safe default except where
# the owner must choose (none are required to validate or plan).

variable "aws_region" {
  description = "Region for the bucket, the Lambda and the Bedrock calls."
  type        = string
  default     = "us-east-1"

  validation {
    condition     = can(regex("^[a-z]{2}(-[a-z]+)+-[0-9]$", var.aws_region))
    error_message = "aws_region must look like us-east-1."
  }
}

variable "project_name" {
  description = "Prefix for resource names and the Project tag."
  type        = string
  default     = "awari"

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{1,20}$", var.project_name))
    error_message = "project_name must be 2-21 lowercase letters, digits or hyphens."
  }
}

variable "bucket_name" {
  description = "Exact site bucket name. Null lets AWS add a unique suffix to \"<project_name>-site-\"."
  type        = string
  default     = null
}

variable "price_class" {
  description = "CloudFront price class. PriceClass_All reaches African and South American edges best; PriceClass_100 is cheapest."
  type        = string
  default     = "PriceClass_All"

  validation {
    condition     = contains(["PriceClass_100", "PriceClass_200", "PriceClass_All"], var.price_class)
    error_message = "price_class must be PriceClass_100, PriceClass_200 or PriceClass_All."
  }
}

variable "domain_name" {
  description = "Optional custom domain (for example awari.example.org). Needs acm_certificate_arn."
  type        = string
  default     = null
}

variable "acm_certificate_arn" {
  description = "ACM certificate in us-east-1 for domain_name. Null uses the CloudFront default certificate."
  type        = string
  default     = null

  validation {
    condition     = var.acm_certificate_arn == null || can(regex("^arn:aws[a-z-]*:acm:us-east-1:[0-9]{12}:certificate/", var.acm_certificate_arn))
    error_message = "acm_certificate_arn must be an ACM certificate ARN in us-east-1."
  }
}

variable "enable_quiz_service" {
  description = "Create the optional quiz Lambda and its /api/quiz route. The app works without it."
  type        = bool
  default     = true
}

variable "bedrock_model_id" {
  description = "Bedrock model ID or geo-prefixed inference profile ID used by the quiz service."
  type        = string
  default     = "anthropic.claude-haiku-5-5"

  validation {
    condition     = can(regex("^((global|us|eu|apac|jp|au|ca)\\.)?anthropic\\.claude-[a-z0-9.:-]+$", var.bedrock_model_id))
    error_message = "bedrock_model_id must be a Claude model ID (anthropic.claude-...) or an inference profile ID such as global.anthropic.claude-...."
  }
}

variable "bedrock_region" {
  description = "Region the quiz service calls Bedrock in. Null means aws_region."
  type        = string
  default     = null
}

variable "quiz_timeout_seconds" {
  description = "Lambda timeout. Must stay under CloudFront's 60 s origin read timeout."
  type        = number
  default     = 45

  validation {
    condition     = var.quiz_timeout_seconds >= 5 && var.quiz_timeout_seconds <= 55
    error_message = "quiz_timeout_seconds must be between 5 and 55."
  }
}

variable "quiz_memory_mb" {
  description = "Lambda memory in MB."
  type        = number
  default     = 256

  validation {
    condition     = var.quiz_memory_mb >= 128 && var.quiz_memory_mb <= 1024
    error_message = "quiz_memory_mb must be between 128 and 1024."
  }
}

variable "quiz_reserved_concurrency" {
  description = "Most quiz requests served at once (caps Bedrock spend). Null leaves it unreserved, needed on new accounts whose concurrency limit is 10."
  type        = number
  default     = 2

  validation {
    condition     = var.quiz_reserved_concurrency == null || try(var.quiz_reserved_concurrency >= 1 && var.quiz_reserved_concurrency <= 20, false)
    error_message = "quiz_reserved_concurrency must be null or between 1 and 20."
  }
}

variable "log_retention_days" {
  description = "Days to keep quiz service logs."
  type        = number
  default     = 14

  validation {
    condition     = contains([1, 3, 5, 7, 14, 30, 60, 90], var.log_retention_days)
    error_message = "log_retention_days must be one of 1, 3, 5, 7, 14, 30, 60, 90."
  }
}

variable "allowed_origins" {
  description = "Extra browser origins allowed to call the quiz API cross-origin (the site itself calls it same-origin and needs none)."
  type        = list(string)
  default     = []

  validation {
    condition     = alltrue([for o in var.allowed_origins : can(regex("^(https://[a-z0-9.-]+|http://(localhost|127\\.0\\.0\\.1)(:[0-9]+)?)$", o))])
    error_message = "allowed_origins must be https:// origins (or http://localhost for development), without paths."
  }
}

variable "quiz_lambda_bundle" {
  description = "Path to the built Lambda bundle. Null means services/quiz-lambda/dist/index.mjs in this repo."
  type        = string
  default     = null
}

variable "tags" {
  description = "Extra tags for every resource."
  type        = map(string)
  default     = {}
}
