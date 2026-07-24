// Manual payment collection config. No gateway/merchant account required:
// the buyer sends money to one of these wallet numbers and submits their
// transaction id, which an admin confirms on /admin. When you later get a
// real gateway, swap the enroll flow back to getPaymentProvider() — nothing
// else changes.

export type ManualMethodId = "bkash" | "nagad";

export interface ManualMethod {
  id: ManualMethodId;
  label: string;
  number: string;
  /** How the buyer should send it (bKash "Send Money", etc.). */
  action: string;
}

export function getManualMethods(): ManualMethod[] {
  const methods: ManualMethod[] = [];
  const bkash = process.env.MANUAL_BKASH_NUMBER?.trim();
  const nagad = process.env.MANUAL_NAGAD_NUMBER?.trim();
  if (bkash) methods.push({ id: "bkash", label: "bKash", number: bkash, action: "Send Money" });
  if (nagad) methods.push({ id: "nagad", label: "Nagad", number: nagad, action: "Send Money" });
  return methods;
}

export function isManualConfigured(): boolean {
  return getManualMethods().length > 0;
}
