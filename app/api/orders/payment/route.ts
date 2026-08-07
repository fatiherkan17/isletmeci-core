import { NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";

import { TableStatus } from "@prisma/client";



export async function PATCH(
  request: Request
) {


  try {


    const body =
      await request.json();



    const {
      orderId,
      paymentType,
    } = body;





    if(!orderId){


      return NextResponse.json(

        {
          error:"Sipariş bulunamadı"
        },

        {
          status:400
        }

      );

    }







    const order =

      await prisma.order.update({



        where:{

          id:
            orderId

        },



        data:{


          status:"PAID"


        },



        include:{


          table:true


        }



      });









    await prisma.table.update({



      where:{


        id:
          order.tableId


      },



      data:{


        status:
          TableStatus.EMPTY


      }



    });









    return NextResponse.json({



      success:true,



      paymentType:
        paymentType ?? "UNKNOWN",



      order



    });






  } catch(error){



    console.error(

      "PAYMENT ERROR:",

      error

    );




    return NextResponse.json(

      {

        error:
          "Ödeme işlemi başarısız"

      },

      {

        status:500

      }

    );


  }


}