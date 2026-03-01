# Safety and Reliability

## Required controls

- Always run `balance` before transfer.
- Always resolve recipient account with `lookup` before transfer.
- Always request explicit user confirmation.
- Never execute duplicate transfers from uncertain user replies.

## Error handling

When command returns `ok: false`:

1. Show the error message to the user.
2. Include useful context (missing flags, API error, account lookup failure).
3. Ask whether the user wants to retry.

Do not retry automatically.

## Retry policy

Safe automatic retries:

- `balance`
- `banks`
- `lookup`

Do not automatically retry:

- `transfer`
- `transfer-merchant`

Transfer retries require user confirmation to prevent duplicates.

## Amount validation

Reject if:

- amount is missing
- amount is not numeric
- amount is less than or equal to zero

## Idempotency note

Each transfer call creates a generated reference. If there is uncertainty after submission, do not submit again immediately. Ask for user approval before any second attempt.
