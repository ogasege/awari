# Kiro powers: what was available and what was used (spec 26, 14 Nov 2026)

**What is available.** `~/.kiro/powers/registry.json` on this installation lists 26 powers (Postman, Figma, Netlify,
Supabase, Terraform, Strands, AgentCore, Neon, a CDK architect, Datadog, Dynatrace, a SaaS builder, Stripe, Aurora,
a power builder, CloudWatch Application Signals, ECS Express, Snyk and others). None was installed at the start.

**What was installed.** The **Terraform** power by HashiCorp (`terraform`: provider and module documentation, plus a
`terraform-best-practices` steering file), because Awari's AWS stack (`infra/terraform`, 694 lines, 13 `terraform test`s)
is real work in this repository.

- `kiro-cli powers install terraform` (by catalogue name) timed out: the catalogue entry clones over SSH.
- It installed from a clone of the public `kirodotdev/powers` repository over HTTPS, by local path:
  `kiro-cli powers install /Users/mac/workplace/powers-clone/terraform`, which printed `Installed power "terraform"`
  and is recorded in `~/.kiro/powers/installed.json`.

**What it was used for.** The power's steering file `terraform-best-practices.md` was used as a checklist for a review of
`infra/terraform/*.tf` (the live stack). Result, checked against the files:

| Rule in the power | Awari's Terraform | Verdict |
|---|---|---|
| Pin provider versions | `aws ~> 6.0`, `archive ~> 2.7`, `required_version >= 1.10` in `versions.tf` | meets it |
| Validate inputs, mark secrets sensitive | 16 variables, each with a description and validation blocks on the ones that matter; there are no secrets (the quiz service has no key, it uses an IAM role) | meets it |
| Common tags | `default_tags` in the provider block | meets it |
| No wildcards in IAM | the only `"*"` principal is the bucket policy's explicit **Deny** of insecure transport; Lambda and Bedrock permissions name their resources | meets it |
| Do not commit `.tfvars` with secrets, keep state out of git | `terraform.tfvars`, `terraform.tfstate` and `tfplan` are git-ignored (`git check-ignore` confirms) | meets it |
| Use remote state | **local state** | does not meet it: a one-person demo stack with one owner; a team would move the state to S3 with locking |
| Outputs in `outputs.tf`, split files once past 15 resources | `outputs.tf` exists; `site.tf`, `cdn.tf`, `quiz.tf` | meets it |

**What was not done.** The power's MCP server (`hashicorp/terraform-mcp-server`, Docker) was not started, so no provider
documentation lookup went through the power in this session; only its steering text was used. The power does not appear in
Crew's Agent Capabilities panels. It is not claimed as more than a steering checklist.
