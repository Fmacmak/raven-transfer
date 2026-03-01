---
name: raven-transfer
description: Wallet-aware Raven Atlas transfer operations for NGN payouts. Use when an agent must check wallet balance, resolve Nigerian bank accounts, and execute confirmed transfers to bank beneficiaries or merchant settlement accounts.
---

# Raven Transfer Skill

Execute safe NGN payouts through Raven Atlas.

## Use this skill process

1. Identify payout target type: `bank` or `merchant`.
2. Validate funding by checking wallet balance before any transfer.
3. Resolve account name from account number and bank code.
4. Present a confirmation summary and wait for explicit user approval.
5. Execute transfer exactly once after approval.
6. Report transfer result fields (`trx_ref`, `amount`, `fee`, `status`).

Do not skip confirmation. Do not auto-retry failed transfers without user approval.

## Required environment

- `RAVEN_API_KEY` must be available in the runtime environment.
- Ensure the host agent exposes this variable when running commands.

## Run commands

Run all commands from this skill folder with:

```bash
node ./scripts/raven-transfer.mjs --cmd=<command> [flags]
```

Available commands:

- `balance`: check wallet balance.
- `banks`: list banks (optional `--search`).
- `lookup`: resolve account name (`--bank_code`, `--account_number`).
- `transfer`: transfer to bank beneficiary.
- `transfer-merchant`: transfer to merchant settlement account.

## Merchant payouts

Treat a merchant payout as a normal bank transfer to the merchant's settlement account.

Required merchant transfer details:

- merchant name
- merchant settlement bank name and bank code
- merchant settlement account number
- resolved account name from lookup
- amount and narration

## Reference files

Read these before execution when needed:

- [references/workflow.md](references/workflow.md): deterministic agent workflow and confirmation contract.
- [references/commands.md](references/commands.md): exact command flags and output contract.
- [references/safety.md](references/safety.md): failure handling, retry policy, and guardrails.
- [references/install.md](references/install.md): Codex and generic installation patterns.
