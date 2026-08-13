import { prisma } from "@/app/lib/prisma";

import type {
  PaymentRequest,
  PaymentResult,
} from "./types";

export async function createPayment(
  request: PaymentRequest
): Promise<PaymentResult> {
  // ============================================================
  // IDEMPOTENCY KONTROLÜ
  // ============================================================

  const existingPayment =
    await prisma.payment.findUnique({
      where: {
        idempotencyKey:
          request.idempotencyKey,
      },
    });

  if (existingPayment) {
    return {
      success:
        existingPayment.status ===
        "SUCCEEDED",

      paymentId:
        existingPayment.id,

      status:
        existingPayment.status,

      amount:
        existingPayment.amount,

      providerTransactionId:
        existingPayment.providerTransactionId,

      authorizationCode:
        existingPayment.authorizationCode,

      referenceNumber:
        existingPayment.referenceNumber,

      errorCode:
        existingPayment.errorCode,

      errorMessage:
        existingPayment.errorMessage,
    };
  }

  // ============================================================
  // ÖDEME KAYDI
  // ============================================================

  const payment =
    await prisma.payment.create({
      data: {
        orderId:
          request.orderId,

        amount:
          request.amount,

        method:
          request.method,

        status:
          "PENDING",

        posDeviceId:
          request.posDeviceId,

        idempotencyKey:
          request.idempotencyKey,
      },
    });

  // ============================================================
  // NAKİT ÖDEME
  // ============================================================

  if (request.method === "CASH") {
    const completedPayment =
      await prisma.payment.update({
        where: {
          id: payment.id,
        },

        data: {
          status:
            "SUCCEEDED",

          startedAt:
            new Date(),

          completedAt:
            new Date(),
        },
      });

    return {
      success: true,

      paymentId:
        completedPayment.id,

      status:
        completedPayment.status,

      amount:
        completedPayment.amount,
    };
  }

  // ============================================================
  // KART ÖDEME
  //
  // V1'DE POS ENTEGRASYONU YOK.
  //
  // Fiziksel POS'tan ödeme alındıktan sonra İşletmeci
  // üzerinde Kart seçildiğinde ödeme kaydı başarılı
  // olarak tamamlanır.
  //
  // TokenX / Beko entegrasyonu daha sonra ayrı adapter
  // üzerinden tekrar bağlanacaktır.
  // ============================================================

  if (request.method === "CARD") {
    const completedPayment =
      await prisma.payment.update({
        where: {
          id: payment.id,
        },

        data: {
          status:
            "SUCCEEDED",

          startedAt:
            new Date(),

          completedAt:
            new Date(),
        },
      });

    return {
      success: true,

      paymentId:
        completedPayment.id,

      status:
        completedPayment.status,

      amount:
        completedPayment.amount,
    };
  }

  // ============================================================
  // DİĞER ÖDEME TÜRLERİ
  // ============================================================

  const failedPayment =
    await prisma.payment.update({
      where: {
        id: payment.id,
      },

      data: {
        status:
          "FAILED",

        errorCode:
          "UNSUPPORTED_PAYMENT_METHOD",

        errorMessage:
          "Desteklenmeyen ödeme yöntemi.",
      },
    });

  return {
    success: false,

    paymentId:
      failedPayment.id,

    status:
      failedPayment.status,

    amount:
      failedPayment.amount,

    errorCode:
      failedPayment.errorCode,

    errorMessage:
      failedPayment.errorMessage,
  };
}