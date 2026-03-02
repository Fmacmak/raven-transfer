# Installation

Install this as a folder named `raven-transfer` that contains:

- `SKILL.md`
- `agents/openai.yaml`
- `scripts/raven-transfer.mjs`
- `references/*.md`
- `tests/*.test.mjs`

## Codex-style install

Place the folder in your skills directory:

```bash
mkdir -p "$CODEX_HOME/skills"
cp -R ./raven-transfer "$CODEX_HOME/skills/raven-transfer"
```

Set API key in shell/profile used by the agent runtime:

```bash
export RAVEN_API_KEY="your_raven_api_key_here"
```

## Generic agent install

Install the same folder into the agent's configured skills path.

Requirements:

- Node.js 18+ runtime
- `RAVEN_API_KEY` exposed to the process running commands

## Post-install checks

Run from the skill folder:

```bash
node ./scripts/raven-transfer.mjs --help
node --test ./tests/unit-normalizers.test.mjs
node --test ./tests/contract-live.test.mjs
```

Live contract tests are gated and skipped by default. To run them, set:

- `RAVEN_CONTRACT_TESTS=1`
- `RAVEN_TEST_ACCOUNT_NUMBER` and `RAVEN_TEST_BANK` (or `RAVEN_TEST_BANK_CODE`) for lookup contract tests

The transfer create contract test is intentionally hard-gated to avoid accidental money movement.
