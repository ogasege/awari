/**
 * "Start again" for the progress kept on this device (26-final-review, CD-ROM comparison): stamps, quiz scores and the
 * Castle rooms cleared. Two steps, so a child cannot lose a stamp book by one stray tap.
 */
import { useState } from 'react';
import { EMPTY_PROGRESS, update } from '../../lib/store/progress.ts';

export function ForgetProgress() {
  const [step, setStep] = useState<'idle' | 'sure' | 'done'>('idle');
  if (step === 'done') {
    return (
      <p role="status" className="forget">
        Your stamps, scores and cleared rooms have been forgotten on this device.
      </p>
    );
  }
  if (step === 'sure') {
    return (
      <div className="forget" role="group" aria-label="Start again">
        <p>This clears every stamp, quiz score and cleared room on this device. The articles stay.</p>
        <button
          type="button"
          className="btn btn--ink"
          onClick={() => {
            void update(() => EMPTY_PROGRESS).then(() => setStep('done'));
          }}
        >
          Yes, start again
        </button>{' '}
        <button type="button" className="btn btn--outline" onClick={() => setStep('idle')}>
          No, keep my book
        </button>
      </div>
    );
  }
  return (
    <p className="forget">
      <button type="button" className="btn btn--outline" onClick={() => setStep('sure')}>
        Start my stamp book again
      </button>
    </p>
  );
}
