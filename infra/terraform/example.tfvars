# Copy to terraform.tfvars (git-ignored) and adjust. Every value shown is
# the default unless noted; delete lines you do not need to change.

aws_region   = "us-east-1"
project_name = "awari"

# PriceClass_All includes African edge locations (Johannesburg, Lagos,
# Nairobi...). PriceClass_100 is cheapest but serves Africa from Europe.
price_class = "PriceClass_All"

# Optional custom domain. The certificate must be in us-east-1.
# domain_name         = "awari.example.org"
# acm_certificate_arn = "arn:aws:acm:us-east-1:123456789012:certificate/00000000-0000-0000-0000-000000000000"

# Quiz service (optional; the app works without it).
enable_quiz_service = true

# Claude Haiku 4.5 through the US inference profile (Haiku 5.5 supports only inference
# profiles and is not enabled on every account; it was refused on ours on 2026-11-14).
# Fallback if Converse rejects it in your region:
# bedrock_model_id = "global.anthropic.claude-haiku-4-5-20251001-v1:0"
bedrock_model_id = "us.anthropic.claude-haiku-4-5-20251001-v1:0"
# bedrock_region = "us-east-1"

# Cost and abuse limits.
quiz_timeout_seconds      = 45
quiz_memory_mb            = 256
quiz_reserved_concurrency = 2 # set to null on new accounts limited to 10
log_retention_days        = 14

# Extra origins allowed to call /api/quiz cross-origin (local dev).
allowed_origins = ["http://localhost:5173"]

tags = {
  Event = "Kiroween 2026"
}
