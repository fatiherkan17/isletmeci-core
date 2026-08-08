"use client";

import type { CashierTable } from "@/types/cashier";

interface Props {
  table: CashierTable;
  selected?: boolean;
  onClick?: () => void;
}

const statusConfig: Record<
  CashierTable["status"],
  {
    bg: string;
    border: string;
    badge: string;
    text: string;
    accent: string;
  }
> = {
  EMPTY: {
    bg: "bg-white",
    border: "border-gray-200",
    badge: "⚪",
    text: "Boş",
    accent: "text-gray-500",
  },

  MENU_OPEN: {
    bg: "bg-yellow-50",
    border: "border-yellow-300",
    badge: "🟡",
    text: "Menü Açık",
    accent: "text-yellow-600",
  },

  ORDERED: {
    bg: "bg-orange-50",
    border: "border-orange-300",
    badge: "🟠",
    text: "Sipariş Alındı",
    accent: "text-orange-600",
  },

  PREPARING: {
    bg: "bg-blue-50",
    border: "border-blue-300",
    badge: "🔵",
    text: "Hazırlanıyor",
    accent: "text-blue-600",
  },

  READY: {
    bg: "bg-green-50",
    border: "border-green-300",
    badge: "🟢",
    text: "Hazır",
    accent: "text-green-600",
  },

  PAYMENT: {
    bg: "bg-red-50",
    border: "border-red-300",
    badge: "🔴",
    text: "Hesap Bekliyor",
    accent: "text-red-600",
  },

  CLOSED: {
    bg: "bg-gray-100",
    border: "border-gray-300",
    badge: "⚫",
    text: "Kapalı",
    accent: "text-gray-600",
  },
};

export default function TableCard({
  table,
  selected = false,
  onClick,
}: Props) {
  const status = statusConfig[table.status];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group
        w-full
        overflow-hidden
        rounded-2xl
        border
        text-left
        transition-all
        duration-200
        ${status.bg}
        ${status.border}

        ${
          selected
            ? "border-blue-600 ring-4 ring-blue-100 shadow-lg"
            : "shadow-sm hover:-translate-y-1 hover:shadow-lg"
        }
      `}
    >
      {/* =====================================================
          ÜST BÖLÜM
         ===================================================== */}

      <div
        className="
          flex
          items-start
          justify-between
          gap-3
          p-4
          pb-3
        "
      >
        <div>
          <div
            className="
              text-[11px]
              font-bold
              uppercase
              tracking-wider
              text-gray-400
            "
          >
            Masa
          </div>

          <div
            className="
              mt-0.5
              text-2xl
              font-extrabold
              tracking-tight
              text-gray-900
            "
          >
            {table.name}
          </div>
        </div>

        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-white
            text-xl
            shadow-sm
          "
        >
          {status.badge}
        </div>
      </div>

      {/* =====================================================
          DURUM
         ===================================================== */}

      <div className="px-4">
        <div
          className="
            inline-flex
            items-center
            gap-2
            rounded-full
            bg-white
            px-3
            py-1.5
            text-xs
            font-bold
            shadow-sm
          "
        >
          <span
            className={`
              h-2
              w-2
              rounded-full
              ${
                table.status === "EMPTY"
                  ? "bg-gray-400"
                  : table.status === "MENU_OPEN"
                    ? "bg-yellow-500"
                    : table.status === "ORDERED"
                      ? "bg-orange-500"
                      : table.status === "PREPARING"
                        ? "bg-blue-500"
                        : table.status === "READY"
                          ? "bg-green-500"
                          : table.status === "PAYMENT"
                            ? "bg-red-500"
                            : "bg-gray-500"
              }
            `}
          />

          <span className={status.accent}>
            {status.text}
          </span>
        </div>
      </div>

      {/* =====================================================
          MASA BİLGİLERİ
         ===================================================== */}

      <div
        className="
          mt-4
          grid
          grid-cols-2
          gap-3
          px-4
        "
      >
        <div
          className="
            rounded-xl
            bg-white/80
            p-3
          "
        >
          <div
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-wide
              text-gray-400
            "
          >
            Masa No
          </div>

          <div
            className="
              mt-1
              text-lg
              font-extrabold
              text-gray-900
            "
          >
            #{table.number}
          </div>
        </div>

        <div
          className="
            rounded-xl
            bg-white/80
            p-3
            text-right
          "
        >
          <div
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-wide
              text-gray-400
            "
          >
            Kapasite
          </div>

          <div
            className="
              mt-1
              text-lg
              font-extrabold
              text-gray-900
            "
          >
            {table.capacity}
            <span
              className="
                ml-1
                text-xs
                font-semibold
                text-gray-400
              "
            >
              kişi
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================
          ALT BÖLÜM
         ===================================================== */}

      <div
        className="
          mt-4
          flex
          items-center
          justify-between
          border-t
          border-black/5
          px-4
          py-3
        "
      >
        <span
          className="
            text-xs
            font-medium
            text-gray-400
          "
        >
          Masa durumu
        </span>

        <span
          className={`
            text-xs
            font-bold
            ${
              table.active
                ? "text-green-600"
                : "text-red-600"
            }
          `}
        >
          {table.active ? "Aktif" : "Pasif"}
        </span>
      </div>

      {/* =====================================================
          SEÇİLİ GÖSTERGESİ
         ===================================================== */}

      {selected && (
        <div
          className="
            border-t
            border-blue-200
            bg-blue-600
            px-4
            py-2
            text-center
            text-[11px]
            font-bold
            uppercase
            tracking-wider
            text-white
          "
        >
          ✓ Seçili
        </div>
      )}
    </button>
  );
}