/** Shared test data: an article, good and bad candidates, a fake model. */
import type { ConverseCommandOutput } from '@aws-sdk/client-bedrock-runtime';
import type { LambdaFunctionURLEvent } from 'aws-lambda';
import { articleFromText } from '../../../src/lib/quiz/validate.ts';

export const TITLE = 'Ghana';

export const TEXT = [
  'Ghana is a country in West Africa. Its capital is Accra.',
  'About thirty million people live in Ghana.',
  '',
  '== Geography ==',
  'The Volta River flows into Lake Volta.',
  'The highest point is Mount Afadja.',
  'The coastline faces the Gulf of Guinea.',
  '',
  '== Economy ==',
  'Ghana exports cocoa, gold and oil.',
  'The currency is the cedi.',
].join('\n');

export const ARTICLE = articleFromText(TITLE, TEXT);

/** A raw candidate as the model would submit it. */
export interface RawCandidate {
  prompt: string;
  options: string[];
  answer: number;
  nudge: string;
  whereToLook: string;
  removed: number[];
  proof: string;
}

/** Seven distinct candidates that all pass the validator. */
export const GOOD: RawCandidate[] = [
  {
    prompt: 'What is the capital of Ghana?',
    options: ['Kumasi', 'Accra', 'Tamale', 'Lagos'],
    answer: 1,
    nudge: 'It is on the coast.',
    whereToLook: 'The opening paragraph.',
    removed: [0, 3],
    proof: 'Its capital is Accra.',
  },
  {
    prompt: 'Which lake does the Volta River flow into?',
    options: ['Lake Chad', 'Lake Kivu', 'Lake Volta', 'Lake Malawi'],
    answer: 2,
    nudge: 'It shares a name with the river.',
    whereToLook: 'Geography.',
    removed: [0, 1],
    proof: 'The Volta River flows into Lake Volta.',
  },
  {
    prompt: 'What is the highest point in Ghana?',
    options: ['Mount Kenya', 'Mount Afadja', 'Mount Cameroon', 'Table Mountain'],
    answer: 1,
    nudge: 'It is in the east of the country.',
    whereToLook: 'Geography.',
    removed: [2, 3],
    proof: 'The highest point is Mount Afadja.',
  },
  {
    prompt: 'Which sea area does the coastline face?',
    options: ['Red Sea', 'Gulf of Aden', 'Gulf of Guinea', 'Indian Ocean'],
    answer: 2,
    nudge: 'It is part of the Atlantic Ocean.',
    whereToLook: 'Geography.',
    removed: [0, 3],
    proof: 'The coastline faces the Gulf of Guinea.',
  },
  {
    prompt: 'What is the currency called?',
    options: ['naira', 'cedi', 'rand', 'shilling'],
    answer: 1,
    nudge: 'It is a short word.',
    whereToLook: 'Economy.',
    removed: [0, 2],
    proof: 'The currency is the cedi.',
  },
  {
    prompt: 'Which crop does Ghana export?',
    options: ['coffee', 'tea', 'cocoa', 'rubber'],
    answer: 2,
    nudge: 'Chocolate is made from it.',
    whereToLook: 'Economy.',
    removed: [0, 1],
    proof: 'Ghana exports cocoa, gold and oil.',
  },
  {
    prompt: 'In which part of Africa is the country?',
    options: ['East Africa', 'West Africa', 'North Africa', 'Southern Africa'],
    answer: 1,
    nudge: 'Think of the Atlantic coast.',
    whereToLook: 'The opening paragraph.',
    removed: [0, 2],
    proof: 'Ghana is a country in West Africa.',
  },
];

/** Candidates that each break a rule. */
export const BAD: unknown[] = [
  { ...GOOD[0], proof: 'Its capital is Kumasi.' },
  { ...GOOD[1], answer: 0 },
  { ...GOOD[2], removed: [1, 2] },
  { ...GOOD[3], prompt: 'Is it the Gulf of Guinea?' },
  { ...GOOD[4], options: ['cedi', 'cedi', 'rand', 'naira'] },
  { prompt: 42 },
  'not an object',
  null,
];

/** A Converse response whose tool call carries `questions`. */
export function toolOutput(questions: unknown[]): ConverseCommandOutput {
  return {
    $metadata: {},
    stopReason: 'tool_use',
    metrics: { latencyMs: 1 },
    usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
    output: {
      message: {
        role: 'assistant',
        content: [
          { text: 'Here are the questions.' },
          {
            toolUse: {
              toolUseId: 't1',
              name: 'submit_questions',
              input: { questions } as never,
            },
          },
        ],
      },
    },
  };
}

/** A fake model that returns the given candidate lists, one per call. */
export function fakeConverse(batches: unknown[][]): ((
  input: unknown,
) => Promise<ConverseCommandOutput>) & {
  calls: number;
} {
  const fn = Object.assign(
    async () => {
      const batch = batches[fn.calls] ?? [];
      fn.calls += 1;
      return toolOutput(batch);
    },
    { calls: 0 },
  );
  return fn;
}

/** A function URL event for tests. */
export function event(
  method: string,
  body?: unknown,
  headers: Record<string, string> = {},
): LambdaFunctionURLEvent {
  return {
    version: '2.0',
    routeKey: '$default',
    rawPath: '/api/quiz',
    rawQueryString: '',
    headers,
    isBase64Encoded: false,
    body: body === undefined ? undefined : JSON.stringify(body),
    requestContext: {
      accountId: '123456789012',
      apiId: 'test',
      domainName: 'example.lambda-url.us-east-1.on.aws',
      domainPrefix: 'example',
      http: {
        method,
        path: '/api/quiz',
        protocol: 'HTTP/1.1',
        sourceIp: '127.0.0.1',
        userAgent: 'test',
      },
      requestId: 'r1',
      routeKey: '$default',
      stage: '$default',
      time: '11/Nov/2026:00:00:00 +0000',
      timeEpoch: 0,
    },
  };
}
