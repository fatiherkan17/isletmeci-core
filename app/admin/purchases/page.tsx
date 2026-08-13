import Link from "next/link";
import { prisma } from "@/app/lib/prisma";

export default async function PurchasesPage() {

  const purchases = await prisma.purchase.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Satın Alma
            </h1>

            <p className="text-gray-500 mt-1">
              Tedarikçilerden yapılan satın almaları yönetin.
            </p>
          </div>

          <Link
            href="/admin/purchases/new"
            className="
              bg-black
              text-white
              px-5
              py-3
              rounded-lg
              font-medium
              hover:bg-gray-800
            "
          >
            + Yeni Satın Alma
          </Link>

        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">

          {purchases.length === 0 ? (

            <div className="p-10 text-center">

              <p className="text-gray-500">
                Henüz satın alma kaydı bulunmuyor.
              </p>

              <Link
                href="/admin/purchases/new"
                className="
                  inline-block
                  mt-5
                  bg-black
                  text-white
                  px-5
                  py-3
                  rounded-lg
                "
              >
                İlk Satın Almayı Oluştur
              </Link>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-gray-100">

                  <tr>

                    <th className="text-left px-5 py-4">
                      Tarih
                    </th>

                    <th className="text-left px-5 py-4">
                      Fatura No
                    </th>

                    <th className="text-left px-5 py-4">
                      Durum
                    </th>

                    <th className="text-right px-5 py-4">
                      Toplam
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {purchases.map((purchase) => (

                    <tr
                      key={purchase.id}
                      className="border-t"
                    >

                      <td className="px-5 py-4">

                        {new Date(
                          purchase.purchasedAt ||
                          purchase.createdAt
                        ).toLocaleDateString("tr-TR")}

                      </td>

                      <td className="px-5 py-4">

                        {purchase.invoiceNo || "-"}

                      </td>

                      <td className="px-5 py-4">

                        {purchase.status === "DRAFT" && (
                          <span className="text-gray-600">
                            Taslak
                          </span>
                        )}

                        {purchase.status === "ORDERED" && (
                          <span className="text-blue-600 font-medium">
                            Sipariş Verildi
                          </span>
                        )}

                        {purchase.status === "RECEIVED" && (
                          <span className="text-green-600 font-medium">
                            Teslim Alındı
                          </span>
                        )}

                        {purchase.status === "CANCELLED" && (
                          <span className="text-red-600 font-medium">
                            İptal
                          </span>
                        )}

                      </td>

                      <td className="px-5 py-4 text-right font-semibold">

                        {purchase.total.toFixed(2)} TL

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </main>
  );
}
