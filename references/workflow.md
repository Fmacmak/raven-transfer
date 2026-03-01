# Workflow

Follow this sequence for every payout request.

## 1) Collect transfer intent

Capture:

- target type: `bank` or `merchant`
- amount (NGN)
- bank name (and bank code if already known)
- account number
- narration or payment reason

For `merchant`, capture merchant name as well.

## 2) Confirm funds first

Run:

```bash
node ./scripts/raven-transfer.mjs --cmd=balance
```

If reported balance is below requested amount, stop and ask the user to fund wallet.

## 3) Resolve recipient identity

If bank code is unknown, search for it:

```bash
node ./scripts/raven-transfer.mjs --cmd=banks --search="GTBank"
```

Resolve account name:

```bash
node ./scripts/raven-transfer.mjs --cmd=lookup --bank_code=058 --account_number=0690000031
```

## 4) Present confirmation message

Use this exact pattern:

"About to send NGN <amount> to <account_name> (<account_number>, <bank_name>)<merchant_clause>. Narration: <narration>. Confirm?"

Where `<merchant_clause>` is:

- empty for bank payouts
- ` for merchant <merchant_name>` for merchant payouts

Proceed only on explicit confirmation.

## 5) Execute transfer

Bank:

```bash
node ./scripts/raven-transfer.mjs --cmd=transfer --amount=5000 --bank_code=058 --bank="GTBank" --account_number=0690000031 --account_name="John Doe" --narration="Invoice 182"
```

Merchant:

```bash
node ./scripts/raven-transfer.mjs --cmd=transfer-merchant --merchant="Acme Stores" --amount=5000 --bank_code=058 --bank="GTBank" --account_number=0690000031 --account_name="Acme Stores Ltd" --narration="Merchant settlement"
```

## 6) Return structured completion

Report:

- `trx_ref`
- `amount`
- `fee`
- `status`
- `created_at`

If status is `pending`, tell the user settlement is asynchronous.
