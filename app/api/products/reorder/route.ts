import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";


export async function POST(request: Request) {


  const body = await request.json();


  const {
    productId,
    direction,
  } = body;




  const product = await prisma.product.findUnique({

    where: {

      id: productId,

    },

  });





  if (!product) {

    return NextResponse.json(

      {
        error: "Ürün bulunamadı",
      },

      {
        status: 404,
      }

    );

  }





  const targetProduct = await prisma.product.findFirst({

    where: {

      categoryId: product.categoryId,

      sortOrder: direction === "up"

        ? product.sortOrder - 1

        : product.sortOrder + 1,

    },

  });







  if (!targetProduct) {

    return NextResponse.json({

      message: "Sınırda",

    });

  }







  await prisma.$transaction([



    prisma.product.update({

      where: {

        id: product.id,

      },

      data: {

        sortOrder: targetProduct.sortOrder,

      },

    }),





    prisma.product.update({

      where: {

        id: targetProduct.id,

      },

      data: {

        sortOrder: product.sortOrder,

      },

    }),



  ]);







  return NextResponse.json({

    success: true,

  });



}