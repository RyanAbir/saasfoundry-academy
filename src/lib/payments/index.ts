import type { PaymentProvider, PaymentProviderId } from "./types";
import { BkashProvider } from "./bkash";
import { SslcommerzProvider } from "./sslcommerz";

export type {
  PaymentProvider,
  PaymentProviderId,
  CreateCheckoutInput,
  CreateCheckoutResult,
  IpnValidationResult,
} from "./types";

// The default gateway for new checkouts. bKash direct is the active gateway;
// SSLCommerz stays available behind the same interface (e.g. for Rocket or as
// a fallback), and Nagad slots in here next.
export const DEFAULT_PROVIDER: PaymentProviderId = "bkash";

// Single place the app asks for "the payment gateway". Add providers here
// (Nagad, aamarPay, Lemon Squeezy, Paddle) without touching callers.
export function getPaymentProvider(
  id: PaymentProviderId = DEFAULT_PROVIDER
): PaymentProvider {
  switch (id) {
    case "bkash":
      return new BkashProvider();
    case "sslcommerz":
      return new SslcommerzProvider();
    // case "nagad":
    //   return new NagadProvider();
    default:
      throw new Error(`Payment provider not implemented: ${id}`);
  }
}
