# Requirements: Quiz service

## Introduction

The bundled packs ship five hand-checked questions for every article.
For articles outside the packs (pasted or fetched text), an optional
quiz service on AWS Lambda asks a small Claude model on Amazon Bedrock
for questions with a hint ladder, then checks every question against the
article text before a student sees it. The app never depends on the
service: if it is missing, slow or wrong, the app carries on without it.

The same validator guards questions from the pack pipeline, the Lambda
and the app, so one rule set decides what counts as a fair question.

## Glossary

- **Validator**: `validateQuestion` in `src/lib/quiz/validate.ts`.
- **Article text**: every paragraph of every section of an `Article`,
  joined with single spaces, with whitespace runs collapsed.
- **Normalised**: whitespace runs collapsed to one space and trimmed;
  *folded* additionally means lower-cased.
- **Contains**: folded substring match.
- **Service**: the Lambda in `services/quiz-lambda`.
- **Client**: `fetchRemoteQuiz` in `src/lib/quiz/remote.ts`.

## Requirements

### Requirement 1: Question validation

**User story:** As a student, I want every quiz question to be answerable
from the article I just read, so that I am never marked wrong by a
made-up fact.

1. THE Validator SHALL accept a question only if it has exactly four
   options, each non-empty after trimming.
2. THE Validator SHALL reject a question whose options are not unique
   after trimming and case-folding.
3. THE Validator SHALL reject a question whose `answer` is not an
   integer index of an option.
4. THE Validator SHALL reject a question whose normalised `proof` is
   empty or is not a substring of the normalised article text.
5. THE Validator SHALL reject a question whose `proof` does not contain
   the correct option text (case-insensitive).
6. THE Validator SHALL reject a question whose `proof` contains the text
   of any wrong option (case-insensitive).
7. THE Validator SHALL reject a question whose `proofSection` is not the
   heading of the section that contains the proof (`""` for the lead).
8. THE Validator SHALL reject a question whose `hints.removed` is not two
   distinct integer option indexes that are both wrong answers.
9. THE Validator SHALL reject a question whose `hints.nudge` or
   `hints.whereToLook` is empty or contains the correct option text.
10. THE Validator SHALL reject a question whose `prompt` is empty or
    contains the correct option text.
11. WHEN a question is rejected, THE Validator SHALL return every rule
    it broke as a human-readable reason, not only the first.
12. THE Validator SHALL be pure TypeScript with no Node or DOM APIs, so
    the app, the pack pipeline and the Service import the same file.

### Requirement 2: Articles from plain text

1. THE system SHALL provide one pure function that turns a title and
   plain text into an `Article`, so the Service and the Client build the
   same article from the same input.
2. WHEN the text contains a line of the form `== Heading ==` (any level
   of `=` from 2 to 6), THE function SHALL start a new section with that
   heading; text before the first heading SHALL be the lead (`""`).
3. Blank lines SHALL separate paragraphs; empty sections SHALL be
   dropped.

### Requirement 3: Service request handling

**User story:** As the site owner, I want the service to refuse anything
it was not built for, so that it cannot be abused or run up costs.

1. THE Service SHALL accept only `POST` requests with a JSON body
   `{ "title": string, "text": string, "pack"?: PackId }`, and SHALL
   answer `OPTIONS` preflights from allowed origins.
2. IF the method is anything else, THEN THE Service SHALL respond 405.
3. IF the body is not valid JSON, is larger than 64 KiB, the title is
   empty or longer than 200 characters, the text is shorter than 200 or
   longer than 40,000 characters, or `pack` is not a known pack, THEN THE
   Service SHALL respond 400 (413 for an oversized body) with a short
   JSON error and SHALL NOT call the model.
4. THE Service SHALL NOT fetch any URL supplied by a caller (no
   server-side request forgery surface).
5. WHEN the request carries an `Origin` header listed in the
   `ALLOWED_ORIGINS` setting, THE Service SHALL return CORS headers for
   that origin only; other origins SHALL get no CORS headers.
6. THE Service SHALL read the model ID, region and allowed origins from
   environment variables and SHALL contain no credentials or secrets.

### Requirement 4: Question generation

1. WHEN a valid request arrives, THE Service SHALL build an `Article`
   with the function from Requirement 2 and ask the model, through the
   Bedrock Converse API with a tool whose input schema describes the
   questions, for candidate questions with hint ladders and proof
   sentences copied from the article.
2. THE Service SHALL run the Validator on every candidate and drop every
   candidate that fails.
3. IF fewer than five candidates pass after the first call, THEN THE
   Service SHALL call the model exactly once more, telling it which
   questions it already has, and SHALL make no further calls.
4. THE Service SHALL respond 200 with `{ "questions": Question[],
   "rejected": number }`, with at most five questions, no two with the
   same folded prompt, and `rejected` counting every dropped candidate.
5. IF the model call fails or times out, THEN THE Service SHALL respond
   502 with a short JSON error and SHALL NOT include model output or
   stack traces.
6. THE Bedrock client SHALL be injected so tests run without AWS.

### Requirement 5: Cost and abuse limits

1. THE Service SHALL cap model output with a fixed `maxTokens` and make
   at most two model calls per request.
2. THE Service SHALL use a small, fast Claude model (Haiku class) by
   default, configurable without a code change.

### Requirement 6: Packaging

1. THE Service SHALL be a separate package (`services/quiz-lambda`) on
   Node.js 22 and TypeScript, bundled by esbuild into `dist/` with the
   shared Validator inlined.
2. THE Service SHALL have its own unit tests and type check, with no AWS
   calls.

### Requirement 7: App-side client

**User story:** As a student offline or without the service, I want the
app to keep working, so that a missing extra never breaks a quiz.

1. THE Client SHALL POST the title and text to the configured endpoint
   and SHALL resolve to `null`, never throw, on a network error, a
   non-200 status, invalid JSON, a malformed body, or a timeout
   (default 30 seconds).
2. THE Client SHALL rebuild the article locally and re-run the Validator
   on every returned question, keeping only those that pass.
3. IF no returned question passes, THEN THE Client SHALL resolve to
   `null`.
4. THE Client SHALL send an `x-amz-content-sha256` header holding the
   hex SHA-256 of the body, as CloudFront origin access control requires
   for POST requests to a Lambda function URL.
5. THE Client SHALL accept an injected `fetch` so it can be tested.
