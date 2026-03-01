# Command Reference

## Common

- Script: `node ./scripts/raven-transfer.mjs`
- Auth env var: `RAVEN_API_KEY`
- Output format: JSON object

Successful responses:

- `{"ok": true, ...}`

Failure responses:

- `{"ok": false, "error": "...", "raw": {...optional...}}`

## `--cmd=balance`

No extra flags.

Example:

```bash
node ./scripts/raven-transfer.mjs --cmd=balance
```

Output fields:

- `balance`
- `currency`

## `--cmd=banks`

Optional flag:

- `--search=<keyword>`

Example:

```bash
node ./scripts/raven-transfer.mjs --cmd=banks --search="access"
```

Output fields:

- `banks`: list of `{ "name": string, "code": string }`

## `--cmd=lookup`

Required flags:

- `--bank_code=<code>`
- `--account_number=<number>`

Example:

```bash
node ./scripts/raven-transfer.mjs --cmd=lookup --bank_code=058 --account_number=0690000031
```

Output fields:

- `account_name`
- `account_number`

## `--cmd=transfer`

Required flags:

- `--amount=<number>`
- `--bank_code=<code>`
- `--bank=<bank_name>`
- `--account_number=<number>`
- `--account_name=<resolved_name>`

Optional:

- `--narration=<text>`
- `--currency=NGN` (defaults to `NGN`)

Example:

```bash
node ./scripts/raven-transfer.mjs --cmd=transfer --amount=5000 --bank_code=058 --bank="GTBank" --account_number=0690000031 --account_name="John Doe" --narration="Refund"
```

Output fields:

- `beneficiary_type` (`bank`)
- `trx_ref`
- `merchant_ref`
- `amount`
- `fee`
- `status`
- `created_at`

## `--cmd=transfer-merchant`

Same required flags as `transfer`, plus:

- `--merchant=<merchant_name>`

Example:

```bash
node ./scripts/raven-transfer.mjs --cmd=transfer-merchant --merchant="Acme Stores" --amount=5000 --bank_code=058 --bank="GTBank" --account_number=0690000031 --account_name="Acme Stores Ltd" --narration="Payout"
```

Output fields:

- `beneficiary_type` (`merchant`)
- `merchant`
- `trx_ref`
- `merchant_ref`
- `amount`
- `fee`
- `status`
- `created_at`
