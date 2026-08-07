export const dynamic = "force-dynamic";


import { prisma } from "@/app/lib/prisma";

import CustomerMenu from "@/app/components/customer/CustomerMenu";




interface Props {

  params: Promise<{
    table: string;
  }>;

}





export default async function TableMenuPage({

  params,

}: Props) {



  const { table } =
    await params;



  const tableNumber =
    Number(table);






  const selectedTable =
    await prisma.table.findFirst({

      where: {

        number: tableNumber,

        active: true,

      },

    });







  if (!selectedTable) {


    return (

      <main className="
        min-h-screen
        flex
        items-center
        justify-center
      ">


        <h1 className="
          text-2xl
          font-bold
        ">

          Masa bulunamadı

        </h1>


      </main>

    );


  }









  const products =
    await prisma.product.findMany({

      where: {

        active: true,

        available: true,

      },


      include: {

        category: true,

      },


      orderBy: [

        {

          category: {

            name: "asc",

          },

        },


        {

          sortOrder: "asc",

        },


      ],


    });








  return (

    <CustomerMenu


      products={products}



      tableNumber={

        selectedTable.number

      }



      tableId={

        selectedTable.id

      }



    />

  );


}