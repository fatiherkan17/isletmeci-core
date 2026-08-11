"use client";

import { useEffect, useState } from "react";

interface PosDevice {
  id: string;
  name: string;
  provider: string;
  brand: string;
  model: string | null;
  serialNumber: string | null;
  terminalId: string | null;
  ipAddress: string | null;
  port: number | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const emptyForm = {
  name: "",
  provider: "BEKO",
  brand: "Beko",
  model: "X30TR",
  serialNumber: "",
  terminalId: "",
  ipAddress: "",
  port: "",
  active: true,
};

export default function PosPage() {
  const [devices, setDevices] = useState<PosDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState(emptyForm);

  const [showForm, setShowForm] = useState(false);

  async function loadDevices() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/pos/devices",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ??
            "POS cihazları alınamadı"
        );
      }

      setDevices(data);
    } catch (error) {
      console.error(
        "POS DEVICE LOAD ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "POS cihazları alınamadı"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDevices();
  }, []);

  function updateField(
    field: keyof typeof emptyForm,
    value: string | boolean
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!form.name.trim()) {
      setError(
        "POS cihazı adı zorunludur."
      );
      return;
    }

    if (!form.provider.trim()) {
      setError(
        "POS sağlayıcısı zorunludur."
      );
      return;
    }

    if (!form.brand.trim()) {
      setError(
        "POS markası zorunludur."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        "/api/pos/devices",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name: form.name.trim(),
            provider:
              form.provider.trim(),
            brand:
              form.brand.trim(),
            model:
              form.model.trim() ||
              null,
            serialNumber:
              form.serialNumber.trim() ||
              null,
            terminalId:
              form.terminalId.trim() ||
              null,
            ipAddress:
              form.ipAddress.trim() ||
              null,
            port:
              form.port.trim() ||
              null,
            active: form.active,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ??
            "POS cihazı oluşturulamadı"
        );
      }

      setDevices((current) => [
        ...current,
        data.device,
      ]);

      setForm(emptyForm);
      setShowForm(false);
    } catch (error) {
      console.error(
        "POS DEVICE CREATE ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "POS cihazı oluşturulamadı"
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleDevice(
    device: PosDevice
  ) {
    try {
      setError("");

      const response = await fetch(
        `/api/pos/devices/${device.id}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            active: !device.active,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ??
            "POS cihazı güncellenemedi"
        );
      }

      setDevices((current) =>
        current.map((item) =>
          item.id === device.id
            ? data.device
            : item
        )
      );
    } catch (error) {
      console.error(
        "POS DEVICE UPDATE ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "POS cihazı güncellenemedi"
      );
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            POS Cihazları
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            İşletmede kullanılacak POS cihazlarını
            yönetin.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setShowForm((current) => !current)
          }
          className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          {showForm
            ? "Vazgeç"
            : "+ POS Cihazı Ekle"}
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 rounded-xl border bg-white p-6 shadow-sm"
        >
          <h2 className="mb-5 text-lg font-semibold">
            Yeni POS Cihazı
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Cihaz Adı
              </label>

              <input
                value={form.name}
                onChange={(event) =>
                  updateField(
                    "name",
                    event.target.value
                  )
                }
                placeholder="Nonna Ana POS"
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Sağlayıcı
              </label>

              <input
                value={form.provider}
                onChange={(event) =>
                  updateField(
                    "provider",
                    event.target.value
                  )
                }
                placeholder="BEKO"
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Marka
              </label>

              <input
                value={form.brand}
                onChange={(event) =>
                  updateField(
                    "brand",
                    event.target.value
                  )
                }
                placeholder="Beko"
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Model
              </label>

              <input
                value={form.model}
                onChange={(event) =>
                  updateField(
                    "model",
                    event.target.value
                  )
                }
                placeholder="X30TR"
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Seri Numarası
              </label>

              <input
                value={form.serialNumber}
                onChange={(event) =>
                  updateField(
                    "serialNumber",
                    event.target.value
                  )
                }
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Terminal ID
              </label>

              <input
                value={form.terminalId}
                onChange={(event) =>
                  updateField(
                    "terminalId",
                    event.target.value
                  )
                }
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                IP Adresi
              </label>

              <input
                value={form.ipAddress}
                onChange={(event) =>
                  updateField(
                    "ipAddress",
                    event.target.value
                  )
                }
                placeholder="192.168.1.100"
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Port
              </label>

              <input
                type="number"
                value={form.port}
                onChange={(event) =>
                  updateField(
                    "port",
                    event.target.value
                  )
                }
                placeholder="Örn. 8080"
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-black"
              />
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2">
            <input
              id="pos-active"
              type="checkbox"
              checked={form.active}
              onChange={(event) =>
                updateField(
                  "active",
                  event.target.checked
                )
              }
            />

            <label
              htmlFor="pos-active"
              className="text-sm"
            >
              Cihaz aktif
            </label>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-black px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving
                ? "Kaydediliyor..."
                : "POS Cihazını Kaydet"}
            </button>
          </div>
        </form>
      )}

      <div className="rounded-xl border bg-white shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold">
            Tanımlı POS Cihazları
          </h2>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-gray-500">
            POS cihazları yükleniyor...
          </div>
        ) : devices.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">
            Henüz POS cihazı tanımlanmamış.
          </div>
        ) : (
          <div className="divide-y">
            {devices.map((device) => (
              <div
                key={device.id}
                className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">
                      {device.name}
                    </h3>

                    <span
                      className={
                        device.active
                          ? "rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700"
                          : "rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600"
                      }
                    >
                      {device.active
                        ? "Aktif"
                        : "Pasif"}
                    </span>
                  </div>

                  <div className="mt-2 text-sm text-gray-500">
                    {device.brand}
                    {device.model
                      ? ` ${device.model}`
                      : ""}
                  </div>

                  <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1 text-xs text-gray-400 md:grid-cols-2">
                    <span>
                      IP:{" "}
                      {device.ipAddress ??
                        "Tanımlanmadı"}
                    </span>

                    <span>
                      Port:{" "}
                      {device.port ??
                        "Tanımlanmadı"}
                    </span>

                    <span>
                      Terminal:{" "}
                      {device.terminalId ??
                        "Tanımlanmadı"}
                    </span>

                    <span>
                      Seri No:{" "}
                      {device.serialNumber ??
                        "Tanımlanmadı"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    toggleDevice(device)
                  }
                  className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
                >
                  {device.active
                    ? "Pasifleştir"
                    : "Aktifleştir"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}