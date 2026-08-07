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

    <section className="
      bg-white
      rounded-2xl
      shadow
      p-6
    ">


      <div className="
        flex
        items-center
        justify-between
        mb-6
      ">


        <div>


          <h2 className="text-2xl font-bold">

            Masalar

          </h2>


          <p className="text-sm text-gray-500 mt-1">

            QR Sipariş Takibi

          </p>


        </div>




        <div className="text-right">


          <div className="text-xs text-gray-500">

            Aktif Masa

          </div>



          <div className="
            text-3xl
            font-bold
            text-green-600
          ">

            {activeTables} / {tables.length}

          </div>


        </div>


      </div>





      <div className="
        grid
        grid-cols-2
        md:grid-cols-3
        xl:grid-cols-5
        gap-5
      ">


        {tables.map((table) => (

          <div

            key={table.id}

            onClick={() => onSelectTable(table.id)}

            className="
              cursor-pointer
              rounded-2xl
            "

          >


            <TableCard

              table={table}

              selected={
                selectedTableId === table.id
              }

            />


          </div>


        ))}


      </div>


    </section>

  );

}