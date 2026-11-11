# Tasks: Quiz service

- [ ] 1. Shared validator
  - [ ] 1.1 `validate.ts` with `validateQuestion`, `articleText`,
        `sectionOfSentence`, `articleFromText`, `isQuestionShape`;
        example tests. _Req 1.1–1.12, 2.1–2.3_
  - [ ] 1.2 Properties 1–9 in `validate.property.test.ts`.
        _Req 1.1–1.11, 2.2, 2.3_
- [ ] 2. Lambda package
  - [ ] 2.1 Package, tsconfig, esbuild bundle, request parsing, CORS,
        handler status codes and tests. _Req 3.1–3.6, 6.1, 6.2_
  - [ ] 2.2 Bedrock Converse call, generate/validate/retry loop,
        Properties 10–11. _Req 4.1–4.6, 5.1, 5.2_
- [ ] 3. App client
  - [ ] 3.1 `remote.ts` with timeout, payload hash, re-validation and
        Property 12. _Req 7.1–7.5_
