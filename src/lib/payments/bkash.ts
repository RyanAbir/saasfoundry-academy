import type {
  CreateCheckoutInput,
  CreateCheckoutResult,
  IpnValidationResult,
  PaymentProvider,
} from "./types";

// bKash Tokenized Checkout (PGW) adapter.
//
// Flow: grant token -> create payment (returns bkashURL) -> redirect user ->
// bKash calls our callback with paymentID + status -> execute payment.
// Docs: https://developer.bka.sh/
//
// Sandbox vs live via BKASH_IS_SANDBOX. API version v1.2.0-beta.

const isSandbox = process.env.BKASH_IS_SANDBOX !== "false";

export const BKASH_BASE_URL = isSandbox
  ? "https://tokenized.sandbox.bka.sh/v1.2.0-beta"
  : "https://tokenized.pay.bka.sh/v1.2.0-beta";

interface BkashTokenResponse {
  id_token?: string;
  token_type?: string;
  expires_in?: number;
  statusCode?: string;
  statusMessage?: string;
}

interface BkashCreateResponse {
  paymentID?: string;
  bkashURL?: string;
  statusCode?: string;
  statusMessage?: string;
}

interface BkashExecuteResponse {
  paymentID?: string;
  trxID?: string;
  transactionStatus?: string; // "Completed" on success
  amount?: string;
  currency?: string;
  merchantInvoiceNumber?: string;
  statusCode?: string; // "0000" on success
  statusMessage?: string;
}

export class BkashProvider implements PaymentProvider {
  readonly id = "bkash" as const;

  private readonly appKey: string;
  private readonly appSecret: string;
  private readonly username: string;
  private readonly password: string;

  constructor() {
    this.appKey = process.env.BKASH_APP_KEY ?? "";
    this.appSecret = process.env.BKASH_APP_SECRET ?? "";
    this.username = process.env.BKASH_USERNAME ?? "";
    this.password = process.env.BKASH_PASSWORD ?? "";
    if (!this.appKey || !this.appSecret || !this.username || !this.password) {
      throw new Error(
        "bKash is not configured. Set BKASH_APP_KEY, BKASH_APP_SECRET, BKASH_USERNAME and BKASH_PASSWORD."
      );
    }
  }

  /** Grant a fresh id_token for a request. */
  private async grantToken(): Promise<string> {
    const res = await fetch(`${BKASH_BASE_URL}/tokenized/checkout/token/grant`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        username: this.username,
        password: this.password,
      },
      body: JSON.stringify({ app_key: this.appKey, app_secret: this.appSecret }),
    });
    if (!res.ok) throw new Error(`bKash token grant failed: HTTP ${res.status}`);
    const data = (await res.json()) as BkashTokenResponse;
    if (!data.id_token) {
      throw new Error(
        `bKash token grant returned no token: ${data.statusMessage ?? data.statusCode ?? "unknown"}`
      );
    }
    return data.id_token;
  }

  private authHeaders(token: string) {
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: token,
      "X-APP-Key": this.appKey,
    };
  }

  async createCheckoutSession(
    input: CreateCheckoutInput
  ): Promise<CreateCheckoutResult> {
    if (!input.callbackUrl) {
      throw new Error("bKash requires a callbackUrl in the checkout input.");
    }
    const token = await this.grantToken();

    const res = await fetch(`${BKASH_BASE_URL}/tokenized/checkout/create`, {
      method: "POST",
      headers: this.authHeaders(token),
      body: JSON.stringify({
        mode: "0011", // tokenized checkout, no agreement
        payerReference: input.customer.phone || input.customer.email,
        callbackURL: input.callbackUrl,
        amount: String(input.amountBdt),
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: input.purchaseId,
      }),
    });
    if (!res.ok) throw new Error(`bKash create payment failed: HTTP ${res.status}`);

    const data = (await res.json()) as BkashCreateResponse;
    if (!data.bkashURL || !data.paymentID) {
      throw new Error(
        `bKash did not return a checkout URL: ${data.statusMessage ?? data.statusCode ?? "unknown error"}`
      );
    }

    return { redirectUrl: data.bkashURL, providerTxnId: data.paymentID };
  }

  /** Finalize a created payment after the customer returns via callback. */
  async executePayment(paymentId: string): Promise<IpnValidationResult> {
    const token = await this.grantToken();

    const res = await fetch(`${BKASH_BASE_URL}/tokenized/checkout/execute`, {
      method: "POST",
      headers: this.authHeaders(token),
      body: JSON.stringify({ paymentID: paymentId }),
    });
    if (!res.ok) throw new Error(`bKash execute failed: HTTP ${res.status}`);

    const data = (await res.json()) as BkashExecuteResponse;
    const isPaid =
      data.transactionStatus === "Completed" && data.statusCode === "0000";

    return {
      purchaseId: data.merchantInvoiceNumber || "",
      isPaid,
      providerTxnId: data.trxID || paymentId,
      valId: data.paymentID || paymentId,
      amountBdt: data.amount ? Math.round(parseFloat(data.amount)) : 0,
      method: "bkash",
      raw: data as Record<string, unknown>,
    };
  }
}
