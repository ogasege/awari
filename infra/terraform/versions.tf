# Providers and versions for the Awari stack. Credentials come from the
# standard AWS environment (profile, SSO or role); none live here.

terraform {
  required_version = ">= 1.10"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.7"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = merge(var.tags, {
      Project   = var.project_name
      ManagedBy = "terraform"
    })
  }
}

data "aws_caller_identity" "current" {}

data "aws_partition" "current" {}
