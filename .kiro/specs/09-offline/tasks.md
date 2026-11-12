# Tasks: Offline

- [x] 1. Spec: requirements, design with properties, tasks.
- [x] 2. Pure logic
  - [x] 2.1 `src/sw/strategy.ts` with Properties 1-6. _Req 1.2, 1.4, 2.1-2.4_
- [x] 3. Worker and build
  - [x] 3.1 `sw.ts`, `scripts/build-sw.ts` wired into `npm run build`,
        web manifest. _Req 1.1-1.4, 2.1-2.4_
- [x] 4. App
  - [x] 4.1 `register.ts` store, `useOfflineStatus`, honest header badge,
        test. _Req 3.1, 3.2_
- [x] 5. Proof
  - [x] 5.1 `npm run offline-check` in airplane mode; fix what it finds.
        _Req 4.1, 4.2_
