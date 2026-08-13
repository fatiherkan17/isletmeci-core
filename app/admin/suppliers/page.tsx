import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { toggleSupplierStatus } from "@/app/actions/supplier";

export default async function SuppliersPage() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: [
      { active: "desc" },
      { name: "asc" },
    ],
  });

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Tedarikçi Yönetimi
            </h1>

            <p className="text-gray-500 mt-1">
              İşletmenin çalıştığı tedarikçileri yönetin.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/admin/purchases"
              className="border border-gray-300 bg-white px-4 py-3 rounded-lg hover:bg-gray-50"
            >
              Satın Almalar
            </Link>

            <Link
              href="/admin/suppliers/new"
              className="bg-black text-white px-5 py-3 rounded-lg hover:bg-gray-800"
            >
              + Yeni Tedarikçi
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">

          {suppliers.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-gray-500">
                Henüz tedarikçi bulunmuyor.
              </p>

              <Link
                href="/admin/suppliers/new"
                className="inline-block mt-5 bg-black text-white px-5 py-3 rounded-lg"
              >
                İlk Tedarikçiyi Oluştur
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">

                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-5 py-4 text-left">
                      Tedarikçi
                    </th>

                    <th className="px-5 py-4 text-left">
                      Kod
                    </th>

                    <th className="px-5 py-4 text-left">
                      Telefon
                    </th>

                    <th className="px-5 py-4 text-left">
                      E-posta
                    </th>

                    <th className="px-5 py-4 text-left">
                      Vergi No
                    </th>

                    <th className="px-5 py-4 text-left">
                      Durum
                    </th>

                    <th className="px-5 py-4 text-right">
                      İşlem
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {suppliers.map((supplier) => (
                    <tr
                      key={supplier.id}
                      className="border-b last:border-0"
                    >
                      <td className="px-5 py-4">
                        <div className="font-semibold">
                          {supplier.name}
                        </div>

                        {supplier.address && (
                          <div className="text-sm text-gray-500 mt-1">
                            {supplier.address}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {supplier.code || "-"}
                      </td>

                      <td className="px-5 py-4">
                        {supplier.phone || "-"}
                      </td>

                      <td className="px-5 py-4">
                        {supplier.email || "-"}
                      </td>

                      <td className="px-5 py-4">
                        {supplier.taxNumber || "-"}
                      </td>

                      <td className="px-5 py-4">
                        {supplier.active ? (
                          <span className="inline-flex rounded-full bg-green-100 text-green-700 px-3 py-1 text-sm font-medium">
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-gray-100 text-gray-600 px-3 py-1 text-sm font-medium">
                            Pasif
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end">
                          <form action={toggleSupplierStatus}>
                            <input
                              type="hidden"
                              name="id"
                              value={supplier.id}
                            />

                            <button
                              type="submit"
                              className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700"
                            >
                              {supplier.active
                                ? "Pasif Yap"
                                : "Aktif Yap"}
                            </button>
                          </form>
                        </div>
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
