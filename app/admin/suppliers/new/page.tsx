import Link from "next/link";
import { createSupplier } from "@/app/actions/supplier";

export default function NewSupplierPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Yeni Tedarikçi
            </h1>

            <p className="text-gray-500 mt-1">
              Tedarikçi bilgilerini sisteme kaydedin.
            </p>
          </div>

          <Link
            href="/admin/suppliers"
            className="border border-gray-300 bg-white px-4 py-2 rounded-lg hover:bg-gray-50"
          >
            ← Tedarikçilere Dön
          </Link>
        </div>

        <form action={createSupplier}>

          <div className="bg-white rounded-xl shadow p-6">

            <h2 className="text-xl font-bold mb-6">
              Tedarikçi Bilgileri
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Tedarikçi Adı *
                </label>

                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Örn. ABC Gıda"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Tedarikçi Kodu
                </label>

                <input
                  type="text"
                  name="code"
                  placeholder="Örn. TED-001"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Telefon
                </label>

                <input
                  type="text"
                  name="phone"
                  placeholder="05xx xxx xx xx"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  E-posta
                </label>

                <input
                  type="email"
                  name="email"
                  placeholder="tedarikci@example.com"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Vergi No
                </label>

                <input
                  type="text"
                  name="taxNumber"
                  placeholder="Vergi numarası"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Adres
                </label>

                <textarea
                  name="address"
                  rows={4}
                  placeholder="Tedarikçi adresi"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                />
              </div>

            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">

            <Link
              href="/admin/suppliers"
              className="border border-gray-300 bg-white px-5 py-3 rounded-lg"
            >
              İptal
            </Link>

            <button
              type="submit"
              className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800"
            >
              Tedarikçiyi Kaydet
            </button>

          </div>

        </form>
      </div>
    </main>
  );
}
