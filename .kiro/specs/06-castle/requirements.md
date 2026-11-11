# Requirements: The Castle

## Introduction

A room-by-room trivia game that uses the same question bank as the
quizzes. Each wing has twelve rooms behind twelve doors; each correct
answer lights the next room. Progress is shown as drawn doors.

## Glossary

- **Wing**: a set of twelve rooms on one theme: Africa (country quizzes)
  or Electricity (physics quizzes).
- **Pool**: the ordered list of questions a wing draws from.

## Requirements

### Requirement 1: Wings and rooms

1. THE Castle SHALL offer the Africa wing and the Electricity wing, each
   with twelve rooms, and show for each wing how many rooms are lit in
   words and as drawn doors.
2. THE wing's questions SHALL come from the bundled quiz bank, so every
   castle question passes the shared validator.
3. Consecutive rooms SHALL ask about different articles where the pool
   allows it.

### Requirement 2: Playing a wing

1. WHEN the student enters a wing, THE Castle SHALL show the twelve doors
   and the question behind the next dark door, with the same hint ladder
   and proof slip as quizzes.
2. WHEN the student answers correctly, THE next room SHALL light up and
   the lit count SHALL be saved on the device.
3. IF the answer is revealed after two wrong tries, THEN THE room SHALL
   stay dark and a new question SHALL be asked for the same room.
4. WHEN all twelve rooms are lit, THE Castle SHALL say the wing is
   complete in words and offer the other wing.
5. WHEN the student returns to a wing, THE Castle SHALL continue from the
   saved number of lit rooms; lit rooms never go dark again.
6. Lit and dark doors SHALL differ in fill and in an accessible label
   ("Room 3, lit"), not by colour alone.
