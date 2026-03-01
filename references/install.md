# Installation

Install this as a folder named `raven-transfer` that contains:

- `SKILL.md`
- `agents/openai.yaml`
- `scripts/raven-transfer.mjs`
- `references/*.md`

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

## Post-install smoke checks

Run from the skill folder:

```bash
node ./scripts/raven-transfer.mjs --help
node ./scripts/raven-transfer.mjs --cmd=balance
```

If `balance` fails with auth error, verify `RAVEN_API_KEY` is present in the command environment.
