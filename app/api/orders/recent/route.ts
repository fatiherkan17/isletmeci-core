import { NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";


export async function GET() {

  try {


    const orders =
      await prisma.order.findMany({

        orderBy: {

          createdAt: "desc",

        },


        take: 10,


        include: {


          table: true,


          items: {


            include: {

              product: true,

            },


          },


        },


      });




    return NextResponse.json(orders);



  } catch(error) {


    console.error(
      "RECENT ORDERS ERROR:",
      error
    );


    return NextResponse.json(

      {
        error:
          "Siparişler alınamadı"
      },

      {
        status:500
      }

    );


  }

}