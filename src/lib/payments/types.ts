// The payment abstraction. Every gateway implements this same interface, so
// the rest of the app never imports a specific gateway — only `PaymentProvider`.
//
// Two confirmation styles are supported:
//   - Capture-style (bKash): createCheckoutSession -> redirect -> callback ->
//     executePayment() finalizes and returns the result.
//   - Validation-style (SSLCommerz): createCheckoutSession -> redirect -> IPN ->
//     validateIpn() re-validates server-to-server.
// Either way, a Purchase is only marked paid from a server-side confirmation,
// never from the browser redirect alone (TECH-STACK.md §4).

export type PaymentProviderId =
  | "bkash"
  | "nagad"
  | "rocket"
  | "sslcommerz"
  | "aamarpay";

/** Everything a gateway needs to open a hosted checkout for one Purchase. */
export interface CreateCheckoutInput {
  /** Our Purchase.id — round-trips back to us as the order reference. */
  purchaseId: string;
  /** Amount in BDT (integer taka). */
  amountBdt: number;
  /** What the customer is buying, for the gateway's line item. */
  productName: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  /** Single callback URL (wallet flows like bKash use this). */
  callbackUrl?: string;
  /** Separate redirect URLs (hosted aggregators like SSLCommerz use these). */
  redirectUrls?: {
    success: string;
    fail: string;
    cancel: string;
    /** Server-to-server IPN endpoint. */
    ipn: string;
  };
}

export interface CreateCheckoutResult {
  /** Where to redirect the user's browser to pay. */
  redirectUrl: string;
  /** Gateway's own session/transaction reference (e.g. bKash paymentID). */
  providerTxnId?: string;
}

/** Normalized result of a server-side confirmation (execute or validate). */
export interface IpnValidationResult {
  /** Our Purchase.id, recovered from the gateway payload. */
  purchaseId: string;
  /** Whether the gateway confirms this transaction as genuinely paid. */
  isPaid: boolean;
  /** Gateway transaction id (store on Purchase.providerTxnId). */
  providerTxnId: string;
  /** Extra validation id (e.g. bKash paymentID / SSLCommerz val_id). */
  valId?: string;
  /** Amount the gateway says was actually charged, in BDT. */
  amountBdt: number;
  /** Payment method used: bkash / nagad / rocket / card / bank. */
  method?: string;
  /** Raw payload, kept for debugging / audit. */
  raw: Record<string, unknown>;
}

export interface PaymentProvider {
  readonly id: PaymentProviderId;

  /** Open a hosted checkout for a pending Purchase. */
  createCheckoutSession(input: CreateCheckoutInput): Promise<CreateCheckoutResult>;

  /**
   * Capture-style confirmation (bKash): execute a created payment by its id.
   * Returns the normalized result; the caller marks the Purchase paid.
   */
  executePayment?(paymentId: string): Promise<IpnValidationResult>;

  /**
   * Validation-style confirmation (SSLCommerz IPN): re-validate a callback
   * payload server-to-server.
   */
  validateIpn?(payload: Record<string, unknown>): Promise<IpnValidationResult>;
}
