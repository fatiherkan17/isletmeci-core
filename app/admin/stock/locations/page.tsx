import Link from "next/link";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/prisma";

async function createLocation(formData: FormData) {
  "use server";

  const name = String(formData.get("name") || "").trim();
  const codeRaw = String(formData.get("code") || "").trim();

  if (!name) {
    return;
  }

  const code = codeRaw ? codeRaw.toUpperCase() : null;

  await prisma.stockLocation.create({
    data: {
      name,
      code,
      active: true,
    },
  });

  revalidatePath("/admin/stock/locations");
}

async function toggleLocation(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");

  if (!id) {
    return;
  }

  const location = await prisma.stockLocation.findUnique({
    where: {
      id,
    },
    select: {
      active: true,
    },
  });

  if (!location) {
    return;
  }

  await prisma.stockLocation.update({
    where: {
      id,
    },
    data: {
      active: !location.active,
    },
  });

  revalidatePath("/admin/stock/locations");
}

export default async function StockLocationsPage() {
  const locations = await prisma.stockLocation.findMany({
    orderBy: [
      {
        active: "desc",
      },
      {
        name: "asc",
      },
    ],
  });

  return (
    <main className="max-w-6xl mx-auto">

      {/* ÜST BAŞLIK */}
      <div className="flex items-center justify-between mb-8">

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Stok Lokasyonları
          </h1>

          <p className="text-gray-500 mt-1">
            Depo, mutfak, bar ve diğer stok alanlarını yönetin.
          </p>
        </div>

        <Link
          href="/admin/stock"
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium"
        >
          ← Stok Yönetimi
        </Link>

      </div>


      {/* YENİ LOKASYON */}
      <section className="bg-white rounded-xl shadow p-6 mb-8">

        <h2 className="text-xl font-bold text-gray-900 mb-5">
          Yeni Lokasyon Ekle
        </h2>

        <form
          action={createLocation}
          className="grid md:grid-cols-3 gap-4 items-end"
        >

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Lokasyon Adı
            </label>

            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Örn. Ana Depo"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-black"
            />
          </div>


          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Kod
            </label>

            <input
              id="code"
              name="code"
              type="text"
              placeholder="Örn. DEPO"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 uppercase outline-none focus:ring-2 focus:ring-black"
            />
          </div>


          <button
            type="submit"
            className="bg-black hover:bg-gray-800 text-white rounded-lg px-5 py-3 font-medium"
          >
            + Lokasyon Ekle
          </button>

        </form>

      </section>


      {/* LOKASYONLAR */}
      <section className="bg-white rounded-xl shadow overflow-hidden">

        <div className="px-6 py-5 border-b border-gray-200">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Lokasyonlar
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Toplam {locations.length} lokasyon
              </p>
            </div>

          </div>

        </div>


        {locations.length === 0 ? (

          <div className="p-10 text-center">

            <div className="text-4xl mb-3">
              📦
            </div>

            <h3 className="text-lg font-semibold text-gray-900">
              Henüz lokasyon yok
            </h3>

            <p className="text-gray-500 mt-1">
              Yukarıdaki formu kullanarak ilk stok lokasyonunu oluşturun.
            </p>

          </div>

        ) : (

          <div className="divide-y divide-gray-100">

            {locations.map((location) => (

              <div
                key={location.id}
                className="px-6 py-5 flex items-center justify-between gap-4"
              >

                <div className="min-w-0">

                  <div className="flex items-center gap-3">

                    <h3 className="font-semibold text-gray-900">
                      {location.name}
                    </h3>

                    {location.active ? (

                      <span className="text-xs font-medium bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                        Aktif
                      </span>

                    ) : (

                      <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">
                        Pasif
                      </span>

                    )}

                  </div>


                  <div className="mt-1 text-sm text-gray-500">

                    {location.code ? (
                      <span>
                        Kod:{" "}
                        <span className="font-medium text-gray-700">
                          {location.code}
                        </span>
                      </span>
                    ) : (
                      <span>
                        Kod belirtilmemiş
                      </span>
                    )}

                  </div>

                </div>


                <form action={toggleLocation}>

                  <input
                    type="hidden"
                    name="id"
                    value={location.id}
                  />

                  <button
                    type="submit"
                    className={
                      location.active
                        ? "border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium"
                        : "border border-green-200 text-green-600 hover:bg-green-50 px-4 py-2 rounded-lg text-sm font-medium"
                    }
                  >
                    {location.active ? "Pasif Yap" : "Aktif Yap"}
                  </button>

                </form>

              </div>

            ))}

          </div>

        )}

      </section>

    </main>
  );
}