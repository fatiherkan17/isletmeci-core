import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";



export async function GET(
  request: Request,
  context: {
    params: Promise<{ id: string }>
  }
) {


  const { id } = await context.params;



  const product = await prisma.product.findUnique({

    where: {

      id,

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





  return NextResponse.json(product);

}







export async function PUT(

  request: Request,

  context: {
    params: Promise<{ id: string }>
  }

) {


  const { id } = await context.params;



  const body = await request.json();



  const {

    name,

    description,

    price,

    image,

    categoryId,

    active,

    available,

    featured,

  } = body;





  const product = await prisma.product.update({

    where: {

      id,

    },


    data: {

      name,

      description,

      price,

      image,

      categoryId,

      active,

      available,

      featured,

    },

  });





  return NextResponse.json(product);

}