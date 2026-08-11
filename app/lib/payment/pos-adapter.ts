import type {
  PosPaymentRequest,
  PosPaymentResult,
} from "./types";

export interface PosAdapter {
  startPayment(
    request: PosPaymentRequest
  ): Promise<PosPaymentResult>;

  cancelPayment(
    paymentId: string
  ): Promise<PosPaymentResult>;
}