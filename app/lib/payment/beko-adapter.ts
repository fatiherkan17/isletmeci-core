import type {
  PosPaymentRequest,
  PosPaymentResult,
} from "./types";

import type { PosAdapter } from "./pos-adapter";

export class BekoAdapter implements PosAdapter {
  async startPayment(
    request: PosPaymentRequest
  ): Promise<PosPaymentResult> {
    console.log("BEKO POS PAYMENT REQUEST", {
      paymentId: request.paymentId,
      amount: request.amount,
      idempotencyKey: request.idempotencyKey,
    });

    return {
      success: false,
      status: "FAILED",
      errorCode: "BEKO_NOT_CONFIGURED",
      errorMessage:
        "Beko POS entegrasyonu henüz yapılandırılmadı.",
    };
  }

  async cancelPayment(
    paymentId: string
  ): Promise<PosPaymentResult> {
    console.log("BEKO POS PAYMENT CANCEL", {
      paymentId,
    });

    return {
      success: false,
      status: "FAILED",
      errorCode: "BEKO_NOT_CONFIGURED",
      errorMessage:
        "Beko POS entegrasyonu henüz yapılandırılmadı.",
    };
  }
}