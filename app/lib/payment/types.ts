export type PaymentMethod =
  | "CASH"
  | "CARD"
  | "QR"
  | "TRANSFER";

export type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export interface PaymentRequest {
  orderId: string;
  amount: number;
  method: PaymentMethod;
  idempotencyKey: string;
  posDeviceId?: string;
}

export interface PaymentResult {
  success: boolean;

  paymentId: string;

  status: PaymentStatus;

  amount: number;

  providerTransactionId?: string | null;

  authorizationCode?: string | null;

  referenceNumber?: string | null;

  errorCode?: string | null;

  errorMessage?: string | null;
}

export interface PosPaymentRequest {
  paymentId: string;
  amount: number;
  idempotencyKey: string;
}

export interface PosPaymentResult {
  success: boolean;

  status:
    | "SUCCEEDED"
    | "FAILED"
    | "CANCELLED";

  providerTransactionId?: string | null;

  authorizationCode?: string | null;

  referenceNumber?: string | null;

  errorCode?: string | null;

  errorMessage?: string | null;
}