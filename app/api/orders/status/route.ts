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
      status,
    } = body;





    if(!orderId || !status){


      return NextResponse.json(

        {
          error:"Eksik bilgi"
        },

        {
          status:400
        }

      );

    }








    const order =

      await prisma.order.update({



        where:{

          id:orderId

        },



        data:{

          status

        },



        include:{


          table:true


        }


      });









    let tableStatus: TableStatus =

      TableStatus.ORDERED;








    if(status === "PREPARING"){


      tableStatus =

        TableStatus.PREPARING;


    }








    if(status === "READY"){


      tableStatus =

        TableStatus.READY;


    }








    if(status === "PAID"){


      tableStatus =

        TableStatus.CLOSED;


    }









    await prisma.table.update({



      where:{


        id:
          order.tableId


      },



      data:{


        status:
          tableStatus


      }



    });









    return NextResponse.json({



      success:true,



      order



    });







  } catch(error){



    console.error(

      "STATUS UPDATE ERROR:",

      error

    );





    return NextResponse.json(


      {

        error:
          "Durum güncellenemedi"

      },


      {

        status:500

      }


    );


  }


}