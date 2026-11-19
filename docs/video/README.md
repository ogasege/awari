# Demo video narration

The owner asked for ElevenLabs audio on the demo video (19 Nov). `narration.json` holds the sixteen
lines, in order. For each line, generate speech with the ElevenLabs connection and save it as
`docs/video/audio/<id>.mp3` (for example `docs/video/audio/01-title1.mp3`).

- One voice for all sixteen: a warm, clear, unhurried narrator from the stock voice library (not a
  cloned voice, not a celebrity sound-alike). Write the voice name and model used in
  `docs/video/audio/voice.txt`.
- Speech only: no music, no sound effects. Natural pace; do not rush.
- Say "Awari" as "ah-WAH-ree" (Yoruba for discovery). If the first clip gets it wrong, respell it
  in the request text (for example "Ah-wah-ree") but keep `narration.json` unchanged.
- When all sixteen files exist, write `docs/video/audio/DONE` with the list and each clip's length
  in seconds. If the ElevenLabs tools are not available in this session, write
  `docs/video/audio/FAILED` saying exactly what is missing. Do not commit the mp3 files unless
  they are under 3 MB in total.

## Voice change (owner, 19 Nov 00:26 WAT)

The owner wants "a natural sounding Nigerian accent". The first set used the stock voice Sarah,
which is not that. Redo all sixteen clips:

1. Search the ElevenLabs voice library (shared voices) for Nigerian English narrators, for example
   the search words "Nigerian", "Nigeria", "Lagos", "Yoruba", "West African", accent filter
   Nigerian where the tool has one. Shortlist three (a warm, clear, adult voice, conversational or
   narration use, not a caricature). Prefer a voice whose description says its speaker is
   Nigerian. Add the best one to the account if the tool needs that.
2. Move the Sarah clips to `docs/video/audio/sarah/` (keep them as a fallback).
3. Generate the sixteen clips with the chosen voice into `docs/video/audio/<id>.mp3`. Send "Awari"
   as written; a Nigerian voice should say the Yoruba word naturally. Same settings otherwise
   (speech only, unhurried).
4. Also generate clip 01 with the other two shortlisted voices as
   `docs/video/audio/alt-<voice>-01-title1.mp3`, so the owner can choose by ear.
5. Rewrite `voice.txt` (voice name, id, library description, why chosen) and `DONE` (lengths).
   If no Nigerian voice can be found or used with this connection, write `FAILED` saying exactly
   what was tried and what the owner must do in the ElevenLabs website (for example add a named
   voice from the Voice Library to "My Voices").

## Voice change 2 (owner, 19 Nov 00:45 WAT): a MAN's Nigerian voice

The owner's words: "I want a man's voice please. A man's Nigerian voice if it is available."
The library voice "Chinedu Dike - Nigerian English Narrator" (3W7TIElBzp1JQ8BxQuXK) needs a paid
plan on this account (the website shows "Upgrade to access this voice"), and the owner has not
bought it. So, with what this connection can do today:

1. First try text to speech with voice id 3W7TIElBzp1JQ8BxQuXK once more (the owner may have
   added it). If it works, use it for all sixteen clips and skip step 2.
2. Otherwise DESIGN a voice with the voice design tool (this replaces the earlier "not a
   synthetic one" line; the owner prefers a designed Nigerian man's voice to a foreign accent).
   Description to use, adjust only if the tool asks for a different length:
   "A Nigerian man in his mid thirties from Lagos, speaking natural educated Nigerian English with
   a clear Yoruba-influenced accent. Warm, calm, friendly and unhurried, like a favourite teacher
   reading to children. Studio quality, close microphone, no background noise."
   Generate the previews, save the two most natural as voices in the account (names
   "Awari narrator A" and "Awari narrator B"), and generate clip 01 with each as
   `docs/video/audio/alt-A-01-title1.mp3` and `alt-B-01-title1.mp3`.
3. Generate all sixteen clips with the better of the two into `docs/video/audio/<id>.mp3`
   (model eleven_multilingual_v2 or the newest the voice supports; speed about 0.95; speech only).
   Send "Awari" as written first; respell only if it is said wrongly.
4. Rewrite `voice.txt` and `DONE` (clip lengths). Remove `FAILED`, or rewrite it if this fails too,
   saying exactly which tool call failed and with what message. Do not spend money or change the
   plan. Do not clone any real person's voice.

## Voice ready (19 Nov 01:15 WAT)

A designed voice named **"Awari narrator A"** (a Nigerian man, made with Voice Design on the
ElevenLabs website, which the free plan allows) is now in the account's My Voices. Search My Voices
for "Awari narrator A" to get its id, then do steps 3 and 4 of "Voice change 2" with it: sixteen
clips into `docs/video/audio/<id>.mp3`, `voice.txt`, `DONE`, remove `FAILED`. The narration is
about 1,450 characters; the free plan has enough left for one full set and a few retries, so do not
generate alternates. If "Awari" is said wrongly in clip 02, respell it for clips 02, 11 and 16 only.
