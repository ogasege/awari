# Runbook: the steps only you take

Everything below publishes something or spends money, so the build never does
it for you. Steps marked **PUBLISHES** make something public; steps marked
**COSTS MONEY** create AWS resources. Do them in order. Deadlines: feature
freeze **Fri 27 November 2026**, target submission **Wed 2 December**, hard
deadline **Fri 4 December 2026, 2:00 pm Pacific**. The live app must stay
online and free until **29 January 2027**.

AWS: use your personal CLI profile and never paste keys into a file or chat.

```sh
export AWS_PROFILE=personal
aws sts get-caller-identity          # confirms the profile works; shows an account id, not a key
# If it says the session expired:  aws login
```

## 0. Final local check (free)

```sh
cd ~/workplace/awari
npm ci
npm run submission-check             # hard rules, credits, documents, secret scan, tests, build
npm run offline-check                # airplane-mode proof
```

Both must end with "passed". Then confirm the design-kit photo pages once:
open each link in the last column of the "Design kit photos" table in
`CREDITS.md` and check the picture on the page is the one in `public/photos/`
(the kit did not record which file of a series it used). Fix the link or the
author if one differs, then run `npm run credits`.

## 1. Create the public GitHub repo and push — **PUBLISHES**

The `.kiro` folder must be in the repository and not ignored (the check above
proves it). The repository must be public and show the MIT licence.

```sh
cd ~/workplace/awari
git status --short                   # should be empty
gh auth status                       # logged in as the account you want
gh repo create awari --public --source=. --remote=origin \
  --description "Awari: a free, offline-first encyclopedia for curious students (Kiroween 2026, Resurrection)" \
  --push
gh repo view --web                   # check .kiro/, LICENSE and README render
```

Put the repo URL in `docs/devpost.md`, `docs/judges.md` and
`docs/social-post.md` (replace `[GITHUB URL]`), commit and push:

```sh
git add -A && git commit -m "docs: add repository link" && git push origin main
```

## 2. Plan the infrastructure — free

```sh
cd ~/workplace/awari
npm run build
(cd services/quiz-lambda && npm ci && npm run check)
cd infra/terraform
cp example.tfvars terraform.tfvars   # git-ignored; edit if you want a different region/name
terraform init
terraform plan -out tfplan           # expect "Plan: 20 to add" with the quiz service on
```

Notes from a plan run on 2026-11-12 with the example values: `Plan: 20 to
add, 0 to change, 0 to destroy`; Claude Haiku 5.5 (`anthropic.claude-haiku-5-5`)
is offered in `us-east-1` on the personal account. Anthropic models may ask for
a one-time use-case form in the Bedrock console (*Model catalog → Claude Haiku
5.5*) before the first call.

To skip the quiz service entirely (the app works without it), set
`enable_quiz_service = false` in `terraform.tfvars`: no Lambda, no Bedrock,
no per-request cost.

## 3. Create the stack — **COSTS MONEY**

The site itself (S3 + CloudFront) costs cents a month at this scale. The
quiz service costs a fraction of a cent per generated quiz and is capped by
reserved concurrency 2.

```sh
terraform apply tfplan
```

Set an AWS Budgets alert (for example 5 USD a month) in the console now. If
the account is new and `apply` fails on reserved concurrency, set
`quiz_reserved_concurrency = null` and run plan and apply again.

## 4. Build with the right settings and upload — **PUBLISHES**

If the quiz service is on, the app needs to know where it is; build with:

```sh
cd ~/workplace/awari
VITE_QUIZ_ENDPOINT=/api/quiz npm run build     # omit the variable if the quiz service is off
cd infra/terraform
SITE_BUCKET=$(terraform output -raw bucket_name)
aws s3 sync ../../dist/assets "s3://$SITE_BUCKET/assets" --cache-control "public, max-age=31536000, immutable"
aws s3 sync ../../dist/packs  "s3://$SITE_BUCKET/packs" --delete --cache-control "public, max-age=86400"
aws s3 sync ../../dist "s3://$SITE_BUCKET" --exclude "assets/*" --exclude "packs/*" --exclude "sw.js" --cache-control "public, max-age=60"
aws s3 cp   ../../dist/sw.js "s3://$SITE_BUCKET/sw.js" --cache-control "no-cache"
aws cloudfront create-invalidation --distribution-id "$(terraform output -raw distribution_id)" --paths "/*"
terraform output site_url
```

## 5. Verify the live site — free

```sh
SITE=$(terraform output -raw site_url)
curl -sSI "$SITE/" | grep -iE "^(HTTP|cache-control|strict-transport)"
curl -sSI "$SITE/atlas" | head -1                      # 200 (single-page fallback)
curl -sSI "$SITE/sw.js" | grep -i cache-control        # no-cache
curl -s "$SITE/packs/manifest.json" | head -c 200      # JSON, not HTML
```

Then, in a real browser, follow `docs/judges.md` against `$SITE`: the badge
must reach "Works offline", and airplane mode must keep every feature working.
If the quiz service is on, run the Ghana quiz check from
`infra/terraform/README.md` ("Verify").

Put the site URL in `docs/devpost.md`, `docs/judges.md` and
`docs/social-post.md` (replace `[LIVE URL]`) and push as in step 1.

## 6. Record the video — free

Follow `docs/video-script.md` (2:55 exactly; at least 40 seconds of Kiro).
Upload to YouTube or Vimeo as public or unlisted, put the link in
`docs/devpost.md` (replace `[VIDEO URL]`).

## 7. Submit on Devpost — **PUBLISHES**

1. Category: **Resurrection**.
2. Paste the sections of `docs/devpost.md` into the form fields.
3. Add the repo, live app and video links; add `README.md`'s screenshot and
   two from `docs/screenshots/`.
4. Bonus prizes: post `docs/blog-post.md` (your blog or dev.to) and
   `docs/social-post.md`, then add the links to the submission.
5. Submit by **Wed 2 December** to leave two days of margin.

## 8. Keep it online until 29 January 2027

Do not run `terraform destroy` before then. Check the site on the first of
each month. To stop the quiz service early without taking the site down, set
`enable_quiz_service = false` and `terraform apply`. After the date, to tear
down: empty the bucket in the console (it is versioned), then
`terraform destroy`.
