import { prisma } from "@/app/lib/prisma";

import { BekoAdapter } from "./beko-adapter";

import type {
  PaymentRequest,
  PaymentResult,
} from "./types";

const bekoAdapter = new BekoAdapter();

export async function createPayment(
  request: PaymentRequest
): Promise<PaymentResult> {
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

  if (request.method !== "CARD") {
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

  await prisma.payment.update({
    where: {
      id: payment.id,
    },

    data: {
      status:
        "PROCESSING",

      startedAt:
        new Date(),
    },
  });

  const posResult =
    await bekoAdapter.startPayment({
      paymentId:
        payment.id,

      amount:
        payment.amount,

      idempotencyKey:
        payment.idempotencyKey,
    });

  const finalStatus =
    posResult.success
      ? "SUCCEEDED"
      : posResult.status ===
        "CANCELLED"
      ? "CANCELLED"
      : "FAILED";

  const completedPayment =
    await prisma.payment.update({
      where: {
        id: payment.id,
      },

      data: {
        status:
          finalStatus,

        providerTransactionId:
          posResult.providerTransactionId,

        authorizationCode:
          posResult.authorizationCode,

        referenceNumber:
          posResult.referenceNumber,

        errorCode:
          posResult.errorCode,

        errorMessage:
          posResult.errorMessage,

        completedAt:
          posResult.success
            ? new Date()
            : undefined,

        cancelledAt:
          finalStatus ===
          "CANCELLED"
            ? new Date()
            : undefined,
      },
    });

  return {
    success:
      completedPayment.status ===
      "SUCCEEDED",

    paymentId:
      completedPayment.id,

    status:
      completedPayment.status,

    amount:
      completedPayment.amount,

    providerTransactionId:
      completedPayment.providerTransactionId,

    authorizationCode:
      completedPayment.authorizationCode,

    referenceNumber:
      completedPayment.referenceNumber,

    errorCode:
      completedPayment.errorCode,

    errorMessage:
      completedPayment.errorMessage,
  };
}