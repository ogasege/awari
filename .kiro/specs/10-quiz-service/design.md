# Design: Quiz service

## Overview

```
app (remote.ts) ──POST /api/quiz──▶ CloudFront ──OAC (SigV4)──▶ Lambda URL
                                                                  │
                    validate.ts ◀── shared, pure ──▶ handler.ts ──┤
                                                                  ▼
                                                    Bedrock Converse (Haiku)
```

- `src/lib/quiz/validate.ts`: pure rules, `articleText`,
  `sectionOfSentence`, `articleFromText`, `isQuestionShape`. No Node or
  DOM APIs; imported by the app, the pack pipeline and the Lambda.
- `services/quiz-lambda/src/`:
  - `request.ts` parses and limits the request (Req 3).
  - `cors.ts` builds CORS headers from an allow-list (Req 3.5).
  - `model.ts` holds the system prompt, the `submit_questions` tool
    schema and the Converse call (Req 4.1, 5.1).
  - `generate.ts` runs model → validate → retry once → dedupe → cap 5
    (Req 4.2–4.4).
  - `handler.ts` wires them into a Lambda function URL handler with an
    injected `ConverseSender` (Req 4.5, 4.6). `index.ts` builds the real
    `BedrockRuntimeClient` from environment variables.
- `src/lib/quiz/remote.ts`: the client (Req 7).

## Validator

`normalise(s)` collapses `\s+` to one space and trims; `fold(s)` is
`normalise(s).toLowerCase()`. `articleText(a)` joins every paragraph of
every section with a space and normalises. `sectionOfSentence(a, s)`
returns the heading of the first section whose own normalised text
contains `normalise(s)`, or `null` (a proof that spans two sections has
no section and fails Req 1.7).

`validateQuestion(q, a)` checks every rule and collects reasons. It
never throws on malformed numbers (`NaN`, floats, out of range); those
become reasons. Option-text checks that need the answer (1.5, 1.9, 1.10)
are skipped when the answer index is invalid, which already fails 1.3.

### Option overlap

Rule 1.6 is strict: if a wrong option is a substring of the proof (for
example "Lagos" when the answer is "Lagos State"), the question fails.
The model is told to avoid such options; dropping one question is
cheaper than asking a student an ambiguous one.

## Articles from text

`articleFromText(title, text, pack)` returns an `Article` with `id =
slug(title)`, the given `pack`, sections split on `== Heading ==` lines
(the format of Wikipedia's plain-text extracts) and paragraphs on blank
lines, `summary` = first paragraph, no photos or notes, and a `Source`
crediting Wikipedia under CC BY-SA 4.0 (the expected origin of pasted
text). The Lambda and the client call it with the same input, so the
client re-validates against exactly what the Lambda validated.

## Model call

- Converse with `toolConfig.tools = [submit_questions]` and `toolChoice:
  auto`, and a system prompt that tells the model to call the tool.
  Forced tool choice is avoided because current Haiku-class models run
  with thinking on, which rejects forced tool use.
- No `temperature` (newer models reject sampling parameters).
- `inferenceConfig.maxTokens = 4096`.
- The tool schema asks for 7 candidates of `{prompt, options[4],
  answer, nudge, whereToLook, removed[2], proof}`. The service fills
  `id`, `articleId`, `pack` and computes `proofSection` itself with
  `sectionOfSentence` (the model only quotes the sentence), which
  removes a whole class of model mistakes without weakening Req 1.7.
- The article is sent inside `<article>` tags in the user message and
  the system prompt states that the article is data, not instructions.
- Retry message lists the prompts already accepted and asks for
  different questions.

Default model: `anthropic.claude-haiku-5-5` (Claude Haiku 5.5, the
current Haiku), set by `BEDROCK_MODEL_ID` and the Terraform variable
`bedrock_model_id`. A geo-prefixed inference profile ID (for example
`global.anthropic.claude-haiku-4-5-20251001-v1:0`) also works; the
Terraform IAM policy adapts to either form.

## HTTP contract

| Case | Status | Body |
| --- | --- | --- |
| `OPTIONS` | 204 | empty |
| not POST | 405 | `{error}` |
| body > 64 KiB | 413 | `{error}` |
| invalid input | 400 | `{error}` |
| model failure | 502 | `{error}` |
| success | 200 | `{questions, rejected}` |

The service never answers 403 or 404: CloudFront rewrites those into
the SPA's `index.html`.

## Client

`fetchRemoteQuiz(endpoint, title, text, fetchImpl = fetch, options)`:
serialises the body, hashes it with `crypto.subtle` into
`x-amz-content-sha256`, aborts after `timeoutMs` (default 30 s), checks
the response shape with `isQuestionShape`, rebuilds the article with
`articleFromText` and keeps only questions that pass the Validator.
Every failure path returns `null`.

## Correctness properties

1. *Shuffle invariance*: for any valid question and any permutation of
   its options, remapping `answer` and `hints.removed` through the
   permutation gives a question that is still valid. (Req 1.1–1.10)
2. *Foreign proof*: replacing the proof with any text that is not in
   the article always fails. (Req 1.4)
3. *Missing answer*: replacing the correct option with text that does
   not appear in the proof always fails. (Req 1.5)
4. *Wrong option in proof*: replacing a wrong option with a phrase taken
   from the proof always fails. (Req 1.6)
5. *Bad removal*: any `removed` pair that includes the answer or repeats
   an index always fails. (Req 1.8)
6. *Leaky hints*: inserting the answer text into the prompt, nudge or
   where-to-look always fails. (Req 1.9, 1.10)
7. *Whitespace insensitivity*: re-spacing the proof (any run of spaces,
   tabs or newlines between words) does not change the verdict.
   (Req 1.4)
8. *Reasons*: the verdict is `ok` exactly when the reason list is empty,
   and validation never throws for any structurally typed input.
   (Req 1.11)
9. *Text round trip*: for any list of sections with non-empty headings
   and paragraphs, rendering them as `== Heading ==` text and parsing
   with `articleFromText` gives the same sections. (Req 2.2, 2.3)
10. *Service output*: for any model output, every question the service
    returns passes the Validator, there are at most five, prompts are
    unique, and `returned + rejected` equals the candidates received.
    (Req 4.2–4.4)
11. *Bounded calls*: the service makes one model call when the first
    yields five valid questions and exactly two otherwise. (Req 4.3,
    5.1)
12. *Client re-validation*: whatever the endpoint returns, the client
    returns `null` or a non-empty list of questions that all pass the
    Validator, and never throws. (Req 7.1–7.3)

## Testing

- `src/lib/quiz/validate.test.ts`: examples for every rule.
- `src/lib/quiz/validate.property.test.ts`: Properties 1–9.
- `services/quiz-lambda/test/*.test.ts`: request limits, CORS, handler
  status codes, Properties 10–11 with a fake Converse sender.
- `src/lib/quiz/remote.test.ts`: Property 12 and failure examples with
  a fake `fetch`.
