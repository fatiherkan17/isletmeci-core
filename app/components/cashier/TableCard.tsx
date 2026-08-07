"use client";

import type { CashierTable } from "@/types/cashier";


interface Props {
  table: CashierTable;

  selected?: boolean;
}


const statusConfig: Record<
  CashierTable["status"],
  {
    bg: string;
    border: string;
    badge: string;
    text: string;
  }
> = {

  EMPTY: {
    bg: "bg-white",
    border: "border-gray-300",
    badge: "⚪",
    text: "Boş",
  },


  MENU_OPEN: {
    bg: "bg-yellow-50",
    border: "border-yellow-400",
    badge: "🟡",
    text: "Menü Açık",
  },


  ORDERED: {
    bg: "bg-orange-100",
    border: "border-orange-500",
    badge: "🟠",
    text: "Sipariş Alındı",
  },


  PREPARING: {
    bg: "bg-blue-100",
    border: "border-blue-500",
    badge: "🔵",
    text: "Hazırlanıyor",
  },


  READY: {
    bg: "bg-green-100",
    border: "border-green-600",
    badge: "🟢",
    text: "Hazır",
  },


  PAYMENT: {
    bg: "bg-red-100",
    border: "border-red-500",
    badge: "🔴",
    text: "Hesap Bekliyor",
  },


  CLOSED: {
    bg: "bg-gray-200",
    border: "border-gray-500",
    badge: "⚫",
    text: "Kapalı",
  },

};



export default function TableCard({
  table,
  selected = false,
}: Props) {


  const status = statusConfig[table.status];


  return (

    <button

      className={`
        w-full
        rounded-2xl
        border-2
        p-5
        transition-all
        duration-200
        hover:scale-[1.03]
        hover:shadow-xl
        active:scale-95

        ${status.bg}

        ${
          selected
            ? "border-blue-600 ring-4 ring-blue-300 shadow-xl"
            : status.border
        }
      `}

    >


      <div className="flex justify-between items-center">


        <h2 className="text-xl font-bold">

          {table.name}

        </h2>


        <span className="text-2xl">

          {status.badge}

        </span>


      </div>



      <div className="mt-4">


        <span className="
          inline-flex
          rounded-full
          bg-white/80
          px-3
          py-1
          text-sm
          font-semibold
        ">

          {status.text}

        </span>


      </div>




      <div className="grid grid-cols-2 gap-4 mt-6">


        <div>

          <div className="text-xs text-gray-500">
            Masa No
          </div>


          <div className="text-lg font-bold">

            {table.number}

          </div>


        </div>




        <div className="text-right">


          <div className="text-xs text-gray-500">
            Kapasite
          </div>


          <div className="text-lg font-bold">

            {table.capacity} Kişi

          </div>


        </div>


      </div>





      <div className="
        mt-6
        border-t
        pt-4
        flex
        justify-between
        items-center
      ">


        <span className="text-gray-500">

          Durum

        </span>



        <span
          className={`
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



    </button>

  );
}