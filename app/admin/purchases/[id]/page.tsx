import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/app/lib/prisma";
import { receivePurchase } from "@/app/actions/purchase";

function unitLabel(unit: string) {
  const labels: Record<string, string> = {
    G: "Gram (g)",
    KG: "Kilogram (kg)",
    ML: "Mililitre (ml)",
    L: "Litre (L)",
    ADET: "Adet",
    PAKET: "Paket",
    KOLI: "Koli",
  };

  return labels[unit] || unit;
}

function formatDate(date: Date | null) {
  if (!date) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    "tr-TR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  ).format(date);
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    DRAFT: "Taslak",
    ORDERED: "Sipariş Verildi",
    RECEIVED: "Teslim Alındı",
    CANCELLED: "İptal Edildi",
  };

  return labels[status] || status;
}

export default async function PurchaseDetailPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  const purchase =
    await prisma.purchase.findUnique({
      where: {
        id,
      },
    });

  if (!purchase) {
    notFound();
  }

  const supplier =
    await prisma.supplier.findUnique({
      where: {
        id: purchase.supplierId,
      },
    });

  const purchaseItems =
    await prisma.purchaseItem.findMany({
      where: {
        purchaseId:
          purchase.id,
      },

      orderBy: {
        createdAt: "asc",
      },
    });

  const ingredientIds =
    purchaseItems.map(
      (item) =>
        item.ingredientId
    );

  const ingredients =
    ingredientIds.length > 0
      ? await prisma.ingredient.findMany({
          where: {
            id: {
              in: ingredientIds,
            },
          },
        })
      : [];

  const ingredientMap =
    new Map(
      ingredients.map(
        (ingredient) => [
          ingredient.id,
          ingredient,
        ]
      )
    );

  const calculatedTotal =
    purchaseItems.reduce(
      (sum, item) =>
        sum + item.total,
      0
    );

  return (
    <main className="min-h-screen bg-gray-100">

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* HEADER */}

        <div
          className="
            flex
            flex-col
            md:flex-row
            md:items-center
            md:justify-between
            gap-4
            mb-8
          "
        >

          <div>

            <h1
              className="
                text-3xl
                font-bold
                text-gray-900
              "
            >
              Satın Alma Detayı
            </h1>

            <p
              className="
                text-gray-500
                mt-1
              "
            >
              Oluşturulan satın alma
              kaydını inceleyin.
            </p>

          </div>

          <Link
            href="/admin/purchases"
            className="
              border
              border-gray-300
              bg-white
              px-5
              py-3
              rounded-lg
              hover:bg-gray-50
              w-fit
            "
          >
            ← Satın Almalara Dön
          </Link>

        </div>

        {/* SATIN ALMA BİLGİLERİ */}

        <div
          className="
            bg-white
            rounded-xl
            shadow
            p-6
            mb-6
          "
        >

          <div
            className="
              flex
              flex-col
              md:flex-row
              md:items-start
              md:justify-between
              gap-6
            "
          >

            <div className="flex-1">

              <h2
                className="
                  text-xl
                  font-bold
                  text-gray-900
                "
              >
                Satın Alma Bilgileri
              </h2>

              <div
                className="
                  mt-5
                  grid
                  grid-cols-1
                  md:grid-cols-2
                  gap-5
                "
              >

                <div>

                  <p
                    className="
                      text-sm
                      text-gray-500
                    "
                  >
                    Tedarikçi
                  </p>

                  <p
                    className="
                      font-semibold
                      mt-1
                    "
                  >
                    {supplier?.name ||
                      "Tedarikçi bulunamadı"}
                  </p>

                </div>

                <div>

                  <p
                    className="
                      text-sm
                      text-gray-500
                    "
                  >
                    Durum
                  </p>

                  <span
                    className={`
                      inline-flex
                      mt-1
                      rounded-full
                      px-3
                      py-1
                      text-sm
                      font-medium
                      ${
                        purchase.status ===
                        "RECEIVED"
                          ? "bg-green-100 text-green-700"
                          : purchase.status ===
                            "CANCELLED"
                          ? "bg-red-100 text-red-700"
                          : "bg-orange-100 text-orange-700"
                      }
                    `}
                  >
                    {statusLabel(
                      purchase.status
                    )}
                  </span>

                </div>

                <div>

                  <p
                    className="
                      text-sm
                      text-gray-500
                    "
                  >
                    Fatura No
                  </p>

                  <p
                    className="
                      font-medium
                      mt-1
                    "
                  >
                    {purchase.invoiceNo ||
                      "-"}
                  </p>

                </div>

                <div>

                  <p
                    className="
                      text-sm
                      text-gray-500
                    "
                  >
                    Satın Alma Tarihi
                  </p>

                  <p
                    className="
                      font-medium
                      mt-1
                    "
                  >
                    {formatDate(
                      purchase.purchasedAt
                    )}
                  </p>

                </div>

              </div>

            </div>

            <div className="text-right">

              <p
                className="
                  text-sm
                  text-gray-500
                "
              >
                Toplam
              </p>

              <p
                className="
                  text-3xl
                  font-bold
                  text-gray-900
                  mt-1
                "
              >
                {calculatedTotal.toFixed(
                  2
                )} TL
              </p>

            </div>

          </div>

          {/* TESLİM ALMA */}

          {purchase.status ===
            "DRAFT" && (

            <div
              className="
                mt-6
                border-t
                pt-6
              "
            >

              <div
                className="
                  bg-green-50
                  border
                  border-green-200
                  rounded-xl
                  p-5
                "
              >

                <div
                  className="
                    flex
                    flex-col
                    md:flex-row
                    md:items-center
                    md:justify-between
                    gap-4
                  "
                >

                  <div>

                    <h3
                      className="
                        font-semibold
                        text-green-900
                      "
                    >
                      Satın Alma Teslimi
                    </h3>

                    <p
                      className="
                        text-sm
                        text-green-800
                        mt-1
                      "
                    >
                      Teslim alındığında
                      hammaddeler stoğa
                      eklenecek ve güncel
                      maliyetleri yeniden
                      hesaplanacaktır.
                    </p>

                  </div>

                  <form
                    action={receivePurchase.bind(
                      null,
                      purchase.id
                    )}
                  >

                    <button
                      type="submit"
                      className="
                        bg-green-600
                        text-white
                        px-5
                        py-3
                        rounded-lg
                        font-semibold
                        hover:bg-green-700
                        whitespace-nowrap
                      "
                    >
                      ✓ Teslim Al ve
                      Stoka İşle
                    </button>

                  </form>

                </div>

              </div>

            </div>

          )}

          {/* NOT */}

          {purchase.note && (

            <div
              className="
                mt-6
                border-t
                pt-5
              "
            >

              <p
                className="
                  text-sm
                  text-gray-500
                "
              >
                Not
              </p>

              <p
                className="
                  mt-1
                  text-gray-700
                "
              >
                {purchase.note}
              </p>

            </div>

          )}

        </div>

        {/* ALINAN HAMMADDELER */}

        <div
          className="
            bg-white
            rounded-xl
            shadow
            p-6
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
              mb-5
            "
          >

            <div>

              <h2
                className="
                  text-xl
                  font-bold
                  text-gray-900
                "
              >
                Alınan Hammaddeler
              </h2>

              <p
                className="
                  text-sm
                  text-gray-500
                  mt-1
                "
              >
                Bu satın alma kaydındaki
                hammaddeler.
              </p>

            </div>

            <div
              className="
                text-sm
                text-gray-500
              "
            >
              {purchaseItems.length} kalem
            </div>

          </div>

          {purchaseItems.length ===
          0 ? (

            <div
              className="
                border
                border-dashed
                border-gray-300
                rounded-lg
                p-8
                text-center
              "
            >

              <p
                className="
                  text-gray-500
                "
              >
                Bu satın alma kaydında
                hammadde bulunmuyor.
              </p>

            </div>

          ) : (

            <div
              className="
                overflow-x-auto
              "
            >

              <table
                className="
                  w-full
                  text-sm
                "
              >

                <thead
                  className="
                    border-b
                    bg-gray-50
                  "
                >

                  <tr>

                    <th
                      className="
                        text-left
                        px-4
                        py-3
                      "
                    >
                      Hammadde
                    </th>

                    <th
                      className="
                        text-right
                        px-4
                        py-3
                      "
                    >
                      Miktar
                    </th>

                    <th
                      className="
                        text-right
                        px-4
                        py-3
                      "
                    >
                      Birim
                    </th>

                    <th
                      className="
                        text-right
                        px-4
                        py-3
                      "
                    >
                      Birim Fiyat
                    </th>

                    <th
                      className="
                        text-right
                        px-4
                        py-3
                      "
                    >
                      Toplam
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {purchaseItems.map(
                    (item) => {

                      const ingredient =
                        ingredientMap.get(
                          item.ingredientId
                        );

                      return (
                        <tr
                          key={item.id}
                          className="
                            border-b
                            last:border-0
                          "
                        >

                          <td
                            className="
                              px-4
                              py-4
                              font-medium
                            "
                          >
                            {ingredient?.name ||
                              "Hammadde bulunamadı"}
                          </td>

                          <td
                            className="
                              px-4
                              py-4
                              text-right
                            "
                          >
                            {item.quantity}
                          </td>

                          <td
                            className="
                              px-4
                              py-4
                              text-right
                              text-gray-600
                            "
                          >
                            {unitLabel(
                              item.unit
                            )}
                          </td>

                          <td
                            className="
                              px-4
                              py-4
                              text-right
                            "
                          >
                            {item.unitPrice.toFixed(
                              2
                            )} TL
                          </td>

                          <td
                            className="
                              px-4
                              py-4
                              text-right
                              font-semibold
                            "
                          >
                            {item.total.toFixed(
                              2
                            )} TL
                          </td>

                        </tr>
                      );

                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

        {/* DURUM BİLGİSİ */}

        <div className="mt-6">

          {purchase.status ===
          "RECEIVED" ? (

            <div
              className="
                bg-green-50
                border
                border-green-200
                rounded-xl
                p-5
              "
            >

              <h3
                className="
                  font-semibold
                  text-green-900
                "
              >
                ✓ Satın Alma Teslim Alındı
              </h3>

              <p
                className="
                  text-sm
                  text-green-800
                  mt-1
                "
              >
                Bu satın alma stoka işlendi
                ve hammadde maliyeti
                güncellendi.
              </p>

            </div>

          ) : purchase.status ===
            "DRAFT" ? (

            <div
              className="
                bg-blue-50
                border
                border-blue-200
                rounded-xl
                p-5
              "
            >

              <h3
                className="
                  font-semibold
                  text-blue-900
                "
              >
                Satın Alma Hazır
              </h3>

              <p
                className="
                  text-sm
                  text-blue-800
                  mt-1
                "
              >
                Bu satın alma henüz teslim
                alınmadı. Teslim alındığında
                stok miktarı artırılacaktır.
              </p>

            </div>

          ) : (

            <div
              className="
                bg-gray-50
                border
                border-gray-200
                rounded-xl
                p-5
              "
            >

              <h3
                className="
                  font-semibold
                  text-gray-900
                "
              >
                Satın Alma Durumu
              </h3>

              <p
                className="
                  text-sm
                  text-gray-600
                  mt-1
                "
              >
                Bu kayıt şu anda{" "}
                {statusLabel(
                  purchase.status
                )}{" "}
                durumundadır.
              </p>

            </div>

          )}

        </div>

      </div>

    </main>
  );
}
