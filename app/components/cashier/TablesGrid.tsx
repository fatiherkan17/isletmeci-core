"use client";

import TableCard from "./TableCard";

import type { CashierTable } from "@/types/cashier";

interface Props {
  tables: CashierTable[];
  selectedTableId: string | null;
  onSelectTable: (tableId: string) => void;
}

export default function TablesGrid({
  tables,
  selectedTableId,
  onSelectTable,
}: Props) {
  const activeTables = tables.filter(
    (table) => table.status !== "EMPTY"
  ).length;

  const readyTables = tables.filter(
    (table) => table.status === "READY"
  ).length;

  const paymentTables = tables.filter(
    (table) => table.status === "PAYMENT"
  ).length;

  return (
    <section
      className="
        flex
        min-h-0
        flex-1
        flex-col
        overflow-hidden
        rounded-[30px]
        border
        border-[#ddcbb3]
        bg-gradient-to-br
        from-[#f8efe1]
        via-[#f5eadb]
        to-[#eee0cc]
        p-4
        shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_12px_35px_rgba(78,56,35,0.10)]
        md:p-5
        lg:p-6
      "
    >
      {/* =====================================================
          BAŞLIK
         ===================================================== */}

      <div
        className="
          mb-5
          shrink-0
          rounded-[24px]
          border
          border-[#e7d8c3]
          bg-[#fffaf2]
          px-4
          py-4
          shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_5px_15px_rgba(83,61,38,0.06)]
          md:px-5
        "
      >
        <div
          className="
            flex
            flex-col
            gap-4
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          {/* SOL TARAF */}

          <div className="flex items-center gap-3">
            <div
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-2xl
                border
                border-[#e2cfb3]
                bg-gradient-to-br
                from-[#f8ead5]
                to-[#ead6b9]
                text-2xl
                shadow-[inset_0_2px_3px_rgba(255,255,255,0.9),0_4px_8px_rgba(82,59,36,0.12)]
              "
            >
              🪑
            </div>

            <div>
              <h2
                className="
                  text-xl
                  font-extrabold
                  tracking-tight
                  text-[#46382b]
                  md:text-2xl
                "
              >
                Masalar
              </h2>

              <p className="mt-0.5 text-xs font-medium text-[#907e69] md:text-sm">
                Kasa ve masa takibi
              </p>
            </div>
          </div>

          {/* =================================================
              DURUM ÖZETLERİ
             ================================================= */}

          <div
            className="
              flex
              flex-wrap
              items-center
              gap-2
            "
          >
            {/* AKTİF */}

            <div
              className="
                flex
                items-center
                gap-2
                rounded-xl
                border
                border-[#f0cfaa]
                bg-gradient-to-b
                from-[#fff5e8]
                to-[#ffe9d3]
                px-3
                py-2
                shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_3px_6px_rgba(147,89,38,0.08)]
              "
            >
              <span className="h-2.5 w-2.5 rounded-full bg-[#e47b31] shadow-[0_1px_3px_rgba(180,76,22,0.25)]" />

              <span className="text-xs font-extrabold text-[#96511f]">
                {activeTables} aktif
              </span>
            </div>

            {/* HAZIR */}

            <div
              className="
                flex
                items-center
                gap-2
                rounded-xl
                border
                border-[#bfe0c6]
                bg-gradient-to-b
                from-[#f1fbf3]
                to-[#dff2e3]
                px-3
                py-2
                shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_3px_6px_rgba(45,119,65,0.08)]
              "
            >
              <span className="h-2.5 w-2.5 rounded-full bg-[#39a255] shadow-[0_1px_3px_rgba(37,120,57,0.25)]" />

              <span className="text-xs font-extrabold text-[#3f7f50]">
                {readyTables} hazır
              </span>
            </div>

            {/* HESAP */}

            {paymentTables > 0 && (
              <div
                className="
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-[#e7bdb6]
                  bg-gradient-to-b
                  from-[#fff4f1]
                  to-[#ffe1dc]
                  px-3
                  py-2
                  shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_3px_6px_rgba(153,65,54,0.08)]
                "
              >
                <span className="h-2.5 w-2.5 rounded-full bg-[#d9574b] shadow-[0_1px_3px_rgba(170,55,45,0.25)]" />

                <span className="text-xs font-extrabold text-[#9c5048]">
                  {paymentTables} hesap
                </span>
              </div>
            )}

            {/* TOPLAM */}

            <div
              className="
                flex
                items-center
                gap-1.5
                rounded-xl
                border
                border-[#e1d4c2]
                bg-gradient-to-b
                from-[#fffdf9]
                to-[#f2e8da]
                px-3
                py-2
                shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_3px_6px_rgba(77,57,38,0.06)]
              "
            >
              <span className="text-xs font-bold text-[#91806d]">
                Toplam
              </span>

              <span className="text-xs font-extrabold text-[#4c3d2e]">
                {tables.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          MASALAR
         ===================================================== */}

      {tables.length === 0 ? (
        <div
          className="
            flex
            min-h-48
            flex-1
            items-center
            justify-center
            rounded-[24px]
            border
            border-dashed
            border-[#d9c7b0]
            bg-[#fff8ee]
            text-sm
            text-[#9a8976]
            shadow-[inset_0_2px_8px_rgba(92,67,40,0.04)]
          "
        >
          <div className="text-center">
            <div
              className="
                mx-auto
                mb-3
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-[#f1e2cd]
                text-3xl
                shadow-[inset_0_2px_3px_rgba(255,255,255,0.9),0_5px_10px_rgba(84,61,39,0.10)]
              "
            >
              🪑
            </div>

            <div className="font-bold text-[#665443]">
              Henüz masa bulunamadı.
            </div>
          </div>
        </div>
      ) : (
        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            overscroll-contain
            pr-1
            pb-2
          "
        >
          <div
            className="
              grid
              grid-cols-2
              gap-4
              sm:grid-cols-2
              md:grid-cols-3
              lg:grid-cols-3
              xl:grid-cols-4
              2xl:grid-cols-5
            "
          >
            {tables.map((table) => (
              <TableCard
                key={table.id}
                table={table}
                selected={
                  selectedTableId === table.id
                }
                onClick={() =>
                  onSelectTable(table.id)
                }
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}