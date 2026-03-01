#!/usr/bin/env node

import { randomBytes } from "node:crypto";
import { parseArgs } from "node:util";

const API_BASE = "https://integrations.getravenbank.com/v1";
const TIMEOUT_MS = 30000;

function ok(data) {
  console.log(JSON.stringify({ ok: true, ...data }));
}

function fail(error, raw) {
  console.error(JSON.stringify({ ok: false, error, ...(raw ? { raw } : {}) }));
  process.exit(1);
}

function usage(exitCode = 0) {
  const text = [
    "Usage:",
    "  node ./scripts/raven-transfer.mjs --cmd=balance",
    "  node ./scripts/raven-transfer.mjs --cmd=banks [--search=<keyword>]",
    "  node ./scripts/raven-transfer.mjs --cmd=lookup --bank_code=<code> --account_number=<number>",
    "  node ./scripts/raven-transfer.mjs --cmd=transfer --amount=<n> --bank_code=<code> --bank=<name> --account_number=<number> --account_name=<name> [--narration=<text>] [--currency=NGN]",
    "  node ./scripts/raven-transfer.mjs --cmd=transfer-merchant --merchant=<name> --amount=<n> --bank_code=<code> --bank=<name> --account_number=<number> --account_name=<name> [--narration=<text>] [--currency=NGN]",
  ].join("\n");

  if (exitCode === 0) {
    console.log(text);
  } else {
    console.error(text);
  }
  process.exit(exitCode);
}

function getApiKey() {
  const key = process.env.RAVEN_API_KEY;
  if (!key) {
    fail("RAVEN_API_KEY is not set. Configure it in your skill environment.");
  }
  return key;
}

function getRequired(values, names, cmd) {
  const missing = names.filter((name) => {
    const value = values[name];
    return value === undefined || value === null || `${value}`.trim() === "";
  });

  if (missing.length > 0) {
    fail(`Missing required args for ${cmd}: ${missing.join(", ")}`);
  }
}

function parsePositiveAmount(rawAmount) {
  const amount = Number(rawAmount);
  if (!Number.isFinite(amount) || amount <= 0) {
    fail("--amount must be a positive number");
  }
  return amount;
}

async function ravenRequest(method, path, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${getApiKey()}`,
        "Content-Type": "application/json",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data?.status === "error") {
      fail(data?.message ?? `HTTP ${response.status}`, data);
    }

    return data;
  } catch (error) {
    if (error?.name === "AbortError") {
      fail("Request timeout while calling Raven API");
    }
    fail("Unable to reach Raven API", { message: String(error?.message || error) });
  } finally {
    clearTimeout(timer);
  }
}

async function cmdBalance() {
  const response = await ravenRequest("POST", "/accounts/wallet_balance");
  const data = response?.data ?? response;
  ok({ balance: data?.balance, currency: data?.currency ?? "NGN" });
}

async function cmdBanks(search) {
  const response = await ravenRequest("GET", "/banks");
  let banks = response?.data ?? response;

  if (!Array.isArray(banks)) {
    fail("Unexpected banks response", response);
  }

  if (search) {
    const query = search.toLowerCase();
    banks = banks.filter((bank) => {
      const name = `${bank?.name ?? ""}`.toLowerCase();
      const code = `${bank?.code ?? ""}`.toLowerCase();
      return name.includes(query) || code.includes(query);
    });
  }

  ok({ banks: banks.map((bank) => ({ name: bank?.name, code: bank?.code })) });
}

async function cmdLookup(values) {
  getRequired(values, ["bank_code", "account_number"], "lookup");

  const response = await ravenRequest("POST", "/account_number_lookup", {
    bank_code: values.bank_code,
    account_number: values.account_number,
  });

  const data = response?.data ?? response;
  ok({ account_name: data?.account_name, account_number: data?.account_number });
}

async function cmdTransfer(values, beneficiaryType) {
  getRequired(values, ["amount", "bank_code", "bank", "account_number", "account_name"], beneficiaryType === "merchant" ? "transfer-merchant" : "transfer");

  if (beneficiaryType === "merchant") {
    getRequired(values, ["merchant"], "transfer-merchant");
  }

  const amount = parsePositiveAmount(values.amount);
  const narration = values.narration && values.narration.trim().length > 0
    ? values.narration
    : beneficiaryType === "merchant"
      ? `Merchant payout to ${values.merchant}`
      : `Transfer to ${values.account_name}`;

  const reference = `TXN_${Date.now()}_${randomBytes(4).toString("hex").toUpperCase()}`;
  const response = await ravenRequest("POST", "/transfers/create", {
    amount,
    bank: values.bank,
    bank_code: values.bank_code,
    account_number: values.account_number,
    account_name: values.account_name,
    narration,
    reference,
    currency: values.currency ?? "NGN",
  });

  const data = response?.data ?? response;

  ok({
    beneficiary_type: beneficiaryType,
    ...(beneficiaryType === "merchant" ? { merchant: values.merchant } : {}),
    trx_ref: data?.trx_ref,
    merchant_ref: data?.merchant_ref,
    amount: data?.amount,
    fee: data?.fee,
    status: data?.status,
    created_at: data?.created_at,
  });
}

const { values } = parseArgs({
  options: {
    help: { type: "boolean", short: "h", default: false },
    cmd: { type: "string" },
    search: { type: "string" },
    bank_code: { type: "string" },
    account_number: { type: "string" },
    amount: { type: "string" },
    bank: { type: "string" },
    account_name: { type: "string" },
    narration: { type: "string" },
    merchant: { type: "string" },
    currency: { type: "string", default: "NGN" },
  },
  strict: true,
});

if (values.help) {
  usage(0);
}

if (!values.cmd) {
  usage(1);
}

if (values.cmd === "balance") {
  await cmdBalance();
} else if (values.cmd === "banks") {
  await cmdBanks(values.search);
} else if (values.cmd === "lookup") {
  await cmdLookup(values);
} else if (values.cmd === "transfer") {
  await cmdTransfer(values, "bank");
} else if (values.cmd === "transfer-merchant") {
  await cmdTransfer(values, "merchant");
} else {
  fail(`Unsupported --cmd value: ${values.cmd}`);
}
