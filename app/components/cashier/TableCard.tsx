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
    label: string;
    surface: string;
    border: string;
    accent: string;
    dot: string;
    shadow: string;
    glow: string;
    badge: string;
  }
> = {
  EMPTY: {
    label: "Boş",
    surface: "bg-[#fffaf1]",
    border: "border-[#dfcfb8]",
    accent: "text-[#75624e]",
    dot: "bg-[#a99882]",
    shadow:
      "shadow-[0_7px_0_#d9c7ad,0_14px_28px_rgba(92,67,40,0.10)]",
    glow: "bg-[#c7b59e]",
    badge: "bg-[#eee5d8] text-[#75624e]",
  },

  MENU_OPEN: {
    label: "Menü Açık",
    surface: "bg-[#fff3c7]",
    border: "border-[#e3bd54]",
    accent: "text-[#8b6413]",
    dot: "bg-[#e1a91d]",
    shadow:
      "shadow-[0_7px_0_#d8b34c,0_14px_30px_rgba(166,119,22,0.18)]",
    glow: "bg-[#e1a91d]",
    badge: "bg-[#ffedb0] text-[#8b6413]",
  },

  ORDERED: {
    label: "Sipariş Alındı",
    surface: "bg-[#ffe3cf]",
    border: "border-[#e29a68]",
    accent: "text-[#9c4d20]",
    dot: "bg-[#e36f2f]",
    shadow:
      "shadow-[0_7px_0_#d98550,0_15px_32px_rgba(179,83,30,0.20)]",
    glow: "bg-[#e36f2f]",
    badge: "bg-[#ffd1b5] text-[#9c4d20]",
  },

  PREPARING: {
    label: "Hazırlanıyor",
    surface: "bg-[#dff1f8]",
    border: "border-[#79b9cf]",
    accent: "text-[#376f86]",
    dot: "bg-[#3695b7]",
    shadow:
      "shadow-[0_7px_0_#70afc4,0_15px_32px_rgba(44,119,149,0.18)]",
    glow: "bg-[#3695b7]",
    badge: "bg-[#cbe8f2] text-[#376f86]",
  },

  READY: {
    label: "Hazır",
    surface: "bg-[#dcf4e2]",
    border: "border-[#55b96f]",
    accent: "text-[#27753d]",
    dot: "bg-[#22a447]",
    shadow:
      "shadow-[0_8px_0_#62b978,0_18px_36px_rgba(32,137,59,0.25)]",
    glow: "bg-[#22a447]",
    badge: "bg-[#c4edcf] text-[#27753d]",
  },

  PAYMENT: {
    label: "Hesap Bekliyor",
    surface: "bg-[#ffe1dc]",
    border: "border-[#dc887d]",
    accent: "text-[#98483f]",
    dot: "bg-[#dc5749]",
    shadow:
      "shadow-[0_8px_0_#ce7d73,0_18px_36px_rgba(170,65,54,0.24)]",
    glow: "bg-[#dc5749]",
    badge: "bg-[#ffd0ca] text-[#98483f]",
  },

  CLOSED: {
    label: "Kapalı",
    surface: "bg-[#eee9e2]",
    border: "border-[#cfc5b9]",
    accent: "text-[#6d6359]",
    dot: "bg-[#8d8277]",
    shadow:
      "shadow-[0_7px_0_#c9beb1,0_14px_28px_rgba(80,67,54,0.08)]",
    glow: "bg-[#8d8277]",
    badge: "bg-[#e2dcd4] text-[#6d6359]",
  },
};

export default function TableCard({
  table,
  selected = false,
  onClick,
}: Props) {
  const status = statusConfig[table.status];

  const isReady = table.status === "READY";
  const isOrdered = table.status === "ORDERED";
  const isPreparing = table.status === "PREPARING";
  const isPayment = table.status === "PAYMENT";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group
        relative
        w-full
        overflow-hidden
        rounded-[26px]
        border-2
        text-left
        transition-all
        duration-200
        ease-out
        focus:outline-none
        focus-visible:ring-4
        focus-visible:ring-[#d8c4a9]

        ${status.surface}
        ${status.border}

        ${
          selected
            ? `
              -translate-y-1
              border-[#8b6b48]
              shadow-[0_8px_0_#b99d7c,0_18px_35px_rgba(75,54,35,0.18)]
            `
            : `
              ${status.shadow}
              hover:-translate-y-1
              active:translate-y-[2px]
              active:shadow-[0_3px_0_rgba(100,75,50,0.18)]
            `
        }

        ${
          isReady
            ? "ring-2 ring-[#65c47c]/40"
            : ""
        }
      `}
    >
      {/* =====================================================
          ÜST PARLAKLIK
         ===================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-x-3
          top-2
          h-8
          rounded-full
          bg-white/45
          blur-md
        "
      />

      {/* =====================================================
          DURUM IŞIĞI
         ===================================================== */}

      <div
        className={`
          pointer-events-none
          absolute
          right-4
          top-4
          h-3.5
          w-3.5
          rounded-full
          ${status.dot}
          shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_5px_rgba(0,0,0,0.16)]

          ${
            isReady
              ? "animate-pulse shadow-[0_0_0_5px_rgba(34,164,71,0.12),0_0_16px_rgba(34,164,71,0.45)]"
              : ""
          }
        `}
      />

      {/* =====================================================
          ÖNCELİK GÖSTERGESİ
         ===================================================== */}

      {(isOrdered || isPreparing || isPayment) && (
        <div
          className={`
            pointer-events-none
            absolute
            left-4
            top-4
            flex
            items-center
            gap-1.5
            rounded-full
            px-2.5
            py-1
            text-[9px]
            font-extrabold
            uppercase
            tracking-wide
            shadow-sm
            ${status.badge}
          `}
        >
          <span
            className={`
              h-1.5
              w-1.5
              rounded-full
              ${status.dot}
            `}
          />

          {isOrdered
            ? "Müdahale"
            : isPreparing
              ? "Mutfakta"
              : "Ödeme"}
        </div>
      )}

      {/* =====================================================
          İÇERİK
         ===================================================== */}

      <div className="relative p-5">
        {/* ===================================================
            MASA İKONU
           =================================================== */}

        <div className="flex items-center justify-center py-2">
          <div
            className="
              relative
              flex
              h-24
              w-24
              items-center
              justify-center
              rounded-full
              bg-[#fffdf9]
              shadow-[inset_0_3px_7px_rgba(255,255,255,0.95),0_6px_12px_rgba(87,65,43,0.13)]
            "
          >
            {/* MASA */}

            <div
              className={`
                relative
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-[18px]
                border
                border-[#d8c6ad]
                bg-[#f4e7d4]
                shadow-[inset_0_3px_4px_rgba(255,255,255,0.85),0_5px_0_#d5c0a4,0_8px_12px_rgba(78,58,39,0.15)]

                ${
                  isReady
                    ? "shadow-[inset_0_3px_4px_rgba(255,255,255,0.9),0_5px_0_#70b77e,0_8px_15px_rgba(35,132,59,0.22)]"
                    : ""
                }
              `}
            >
              <span
                className="
                  text-xl
                  font-extrabold
                  text-[#5a4938]
                  drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]
                "
              >
                {table.number}
              </span>

              {/* MASA AYAĞI */}

              <div
                className="
                  absolute
                  -bottom-3
                  left-1/2
                  h-4
                  w-3
                  -translate-x-1/2
                  rounded-b-full
                  bg-[#c7ae91]
                  shadow-[0_3px_3px_rgba(68,49,32,0.15)]
                "
              />
            </div>

            {/* SANDALYELER */}

            <span
              className="
                absolute
                left-1
                top-1/2
                h-5
                w-3
                -translate-y-1/2
                rounded-lg
                bg-[#dfc8aa]
                shadow-[0_2px_3px_rgba(70,50,32,0.12)]
              "
            />

            <span
              className="
                absolute
                right-1
                top-1/2
                h-5
                w-3
                -translate-y-1/2
                rounded-lg
                bg-[#dfc8aa]
                shadow-[0_2px_3px_rgba(70,50,32,0.12)]
              "
            />

            <span
              className="
                absolute
                left-1/2
                top-1
                h-3
                w-5
                -translate-x-1/2
                rounded-lg
                bg-[#dfc8aa]
                shadow-[0_2px_3px_rgba(70,50,32,0.12)]
              "
            />

            <span
              className="
                absolute
                bottom-1
                left-1/2
                h-3
                w-5
                -translate-x-1/2
                rounded-lg
                bg-[#dfc8aa]
                shadow-[0_2px_3px_rgba(70,50,32,0.12)]
              "
            />
          </div>
        </div>

        {/* ===================================================
            MASA ADI
           =================================================== */}

        <div className="mt-4 text-center">
          <div
            className="
              text-xl
              font-extrabold
              tracking-tight
              text-[#4a3b2d]
            "
          >
            {table.name}
          </div>

          {/* DURUM */}

          <div className="mt-2 flex items-center justify-center gap-2">
            <span
              className={`
                h-2.5
                w-2.5
                rounded-full
                ${status.dot}
                shadow-[0_1px_3px_rgba(0,0,0,0.18)]

                ${
                  isReady
                    ? "animate-pulse shadow-[0_0_0_4px_rgba(34,164,71,0.12)]"
                    : ""
                }
              `}
            />

            <span
              className={`
                text-xs
                font-extrabold
                ${status.accent}
              `}
            >
              {status.label}
            </span>
          </div>
        </div>

        {/* ===================================================
            HAZIR DURUMU
           =================================================== */}

        {isReady && (
          <div
            className="
              mt-4
              flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-[#8ed39c]
              bg-[#c9efd2]
              px-3
              py-2
              shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_3px_7px_rgba(35,132,59,0.10)]
            "
          >
            <span
              className="
                flex
                h-5
                w-5
                items-center
                justify-center
                rounded-full
                bg-[#38a956]
                text-[11px]
                font-black
                text-white
                shadow-[0_2px_4px_rgba(35,132,59,0.25)]
              "
            >
              ✓
            </span>

            <span
              className="
                text-[11px]
                font-extrabold
                text-[#27753d]
              "
            >
              ÖDEME ALINABİLİR
            </span>
          </div>
        )}

        {/* ===================================================
            ALT BİLGİ
           =================================================== */}

        <div
          className="
            mt-5
            flex
            items-center
            justify-between
            rounded-2xl
            border
            border-black/5
            bg-white/45
            px-3
            py-2.5
            shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)]
          "
        >
          <div>
            <div
              className="
                text-[9px]
                font-bold
                uppercase
                tracking-wider
                text-[#9b8b79]
              "
            >
              Kapasite
            </div>

            <div
              className="
                mt-0.5
                text-sm
                font-extrabold
                text-[#554536]
              "
            >
              {table.capacity} kişi
            </div>
          </div>

          <div className="text-right">
            <div
              className="
                text-[9px]
                font-bold
                uppercase
                tracking-wider
                text-[#9b8b79]
              "
            >
              Durum
            </div>

            <div
              className={`
                mt-0.5
                text-sm
                font-extrabold
                ${
                  table.active
                    ? "text-[#4f9a64]"
                    : "text-[#a45c53]"
                }
              `}
            >
              {table.active ? "Aktif" : "Pasif"}
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          SEÇİLİ MASA
         ===================================================== */}

      {selected && (
        <div
          className="
            absolute
            bottom-0
            left-1/2
            -translate-x-1/2
            rounded-t-full
            bg-[#8b6b48]
            px-6
            py-1.5
            text-[10px]
            font-extrabold
            uppercase
            tracking-wider
            text-white
            shadow-[0_-2px_6px_rgba(75,54,35,0.15)]
          "
        >
          ✓ Seçili
        </div>
      )}

      {/* =====================================================
          ALT DURUM IŞIĞI
         ===================================================== */}

      <div
        className={`
          pointer-events-none
          absolute
          bottom-0
          left-1/2
          h-1
          -translate-x-1/2
          rounded-full
          transition-all
          duration-300

          ${
            table.status === "EMPTY"
              ? "bg-[#c7b59e]"
              : status.glow
          }

          ${
            selected
              ? "w-20"
              : "w-0 group-hover:w-16"
          }

          ${
            isReady
              ? "w-16 opacity-90"
              : ""
          }
        `}
      />
    </button>
  );
}