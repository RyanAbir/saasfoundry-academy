import type {
  CreateCheckoutInput,
  CreateCheckoutResult,
  IpnValidationResult,
  PaymentProvider,
} from "./types";

// SSLCommerz adapter (hosted checkout + IPN validation).
//
// Sandbox vs live is chosen by SSLCOMMERZ_IS_SANDBOX. Endpoints:
//   sandbox: https://sandbox.sslcommerz.com
//   live:    https://securepay.sslcommerz.com
// Docs: https://developer.sslcommerz.com/

const isSandbox = process.env.SSLCOMMERZ_IS_SANDBOX !== "false";

export const SSLCOMMERZ_BASE_URL = isSandbox
  ? "https://sandbox.sslcommerz.com"
  : "https://securepay.sslcommerz.com";

interface SslcommerzInitResponse {
  status?: string; // "SUCCESS" | "FAILED"
  failedreason?: string;
  sessionkey?: string;
  GatewayPageURL?: string;
}

interface SslcommerzValidationResponse {
  status?: string; // "VALID" | "VALIDATED" | "INVALID_TRANSACTION" | "FAILED"
  tran_id?: string;
  val_id?: string;
  amount?: string;
  currency?: string;
  bank_tran_id?: string;
  card_type?: string;
  card_issuer?: string;
  error?: string;
}

export class SslcommerzProvider implements PaymentProvider {
  readonly id = "sslcommerz" as const;

  private readonly storeId: string;
  private readonly storePassword: string;

  constructor() {
    this.storeId = process.env.SSLCOMMERZ_STORE_ID ?? "";
    this.storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD ?? "";
    if (!this.storeId || !this.storePassword) {
      throw new Error(
        "SSLCommerz is not configured. Set SSLCOMMERZ_STORE_ID and SSLCOMMERZ_STORE_PASSWORD in your environment."
      );
    }
  }

  async createCheckoutSession(
    input: CreateCheckoutInput
  ): Promise<CreateCheckoutResult> {
    if (!input.redirectUrls) {
      throw new Error("SSLCommerz requires redirectUrls in the checkout input.");
    }
    const body = new URLSearchParams({
      store_id: this.storeId,
      store_passwd: this.storePassword,
      total_amount: String(input.amountBdt),
      currency: "BDT",
      // tran_id round-trips back to us on success/IPN as the order reference.
      tran_id: input.purchaseId,
      success_url: input.redirectUrls.success,
      fail_url: input.redirectUrls.fail,
      cancel_url: input.redirectUrls.cancel,
      ipn_url: input.redirectUrls.ipn,
      shipping_method: "NO",
      product_name: input.productName,
      product_category: "Course",
      product_profile: "non-physical-goods",
      cus_name: input.customer.name,
      cus_email: input.customer.email,
      cus_phone: input.customer.phone ?? "N/A",
      cus_add1: "N/A",
      cus_city: "N/A",
      cus_country: "Bangladesh",
    });

    const res = await fetch(`${SSLCOMMERZ_BASE_URL}/gwprocess/v4/api.php`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!res.ok) {
      throw new Error(`SSLCommerz init failed with HTTP ${res.status}`);
    }

    const data = (await res.json()) as SslcommerzInitResponse;

    if (data.status !== "SUCCESS" || !data.GatewayPageURL) {
      throw new Error(
        `SSLCommerz did not return a checkout URL: ${data.failedreason ?? data.status ?? "unknown error"}`
      );
    }

    return {
      redirectUrl: data.GatewayPageURL,
      providerTxnId: data.sessionkey,
    };
  }

  async validateIpn(
    payload: Record<string, unknown>
  ): Promise<IpnValidationResult> {
    const tranId = String(payload.tran_id ?? "");
    const valId = String(payload.val_id ?? "");

    // Never trust the posted status alone — re-validate server-to-server with
    // the val_id against SSLCommerz before treating a payment as real.
    const url = new URL(
      `${SSLCOMMERZ_BASE_URL}/validator/api/validationserverAPI.php`
    );
    url.searchParams.set("val_id", valId);
    url.searchParams.set("store_id", this.storeId);
    url.searchParams.set("store_passwd", this.storePassword);
    url.searchParams.set("format", "json");

    const res = await fetch(url, { method: "GET" });
    if (!res.ok) {
      throw new Error(`SSLCommerz validation failed with HTTP ${res.status}`);
    }

    const data = (await res.json()) as SslcommerzValidationResponse;
    const isPaid = data.status === "VALID" || data.status === "VALIDATED";

    return {
      purchaseId: data.tran_id || tranId,
      isPaid,
      providerTxnId: data.bank_tran_id || data.tran_id || tranId,
      valId: data.val_id || valId,
      amountBdt: data.amount ? Math.round(parseFloat(data.amount)) : 0,
      method: data.card_type || undefined,
      raw: data as Record<string, unknown>,
    };
  }
}
