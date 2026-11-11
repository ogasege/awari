# Tasks: Infrastructure

- [x] 1. Static site
  - [x] 1.1 `versions.tf`, `variables.tf`, private bucket and policy
        (`site.tf`). _Req 1.1–1.3, 7.1_
  - [x] 1.2 OACs, cache policies and distribution (`cdn.tf`);
        Properties 1–5 in `tests/site.tftest.hcl`. _Req 2.1–2.6,
        3.1–3.5, 7.4_
- [x] 2. Quiz service
  - [x] 2.1 Lambda, log group, least-privilege role, function URL,
        CloudFront API origin and permissions (`quiz.tf`); Properties
        6–10 in `tests/quiz.tftest.hcl`. _Req 4.1–4.4, 5.1–5.3,
        6.1–6.4, 7.1, 7.4_
- [x] 3. Outputs and docs
  - [x] 3.1 `outputs.tf`, `example.tfvars`, README with deploy steps
        and abuse/cost controls; fmt, validate and test pass.
        _Req 7.2–7.4_
