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

  return (
    <section
      className="
        rounded-2xl
        border
        border-gray-100
        bg-white
        p-6
        shadow-sm
      "
    >
      {/* =====================================================
          BAŞLIK
         ===================================================== */}

      <div
        className="
          mb-6
          flex
          items-center
          justify-between
          gap-4
        "
      >
        <div>
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                bg-gray-100
                text-xl
              "
            >
              🪑
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-gray-900">
                Masalar
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                QR sipariş ve masa takibi
              </p>
            </div>
          </div>
        </div>

        {/* ===================================================
            AKTİF MASA
           =================================================== */}

        <div
          className="
            rounded-2xl
            bg-gray-50
            px-5
            py-3
            text-right
          "
        >
          <div
            className="
              text-[11px]
              font-bold
              uppercase
              tracking-wide
              text-gray-400
            "
          >
            Aktif Masa
          </div>

          <div
            className="
              mt-0.5
              text-2xl
              font-extrabold
              text-green-600
            "
          >
            {activeTables}

            <span
              className="
                text-base
                font-semibold
                text-gray-400
              "
            >
              {" "}
              / {tables.length}
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================
          MASALAR YOKSA
         ===================================================== */}

      {tables.length === 0 ? (
        <div
          className="
            flex
            min-h-48
            items-center
            justify-center
            rounded-2xl
            border
            border-dashed
            border-gray-200
            bg-gray-50
            text-sm
            text-gray-400
          "
        >
          Masa bulunamadı.
        </div>
      ) : (
        /* ===================================================
           MASA GRID
           =================================================== */

        <div
          className="
            grid
            grid-cols-2
            gap-4
            md:grid-cols-3
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
      )}
    </section>
  );
}