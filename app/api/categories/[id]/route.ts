import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";



export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {


  const { id } = await params;


  const body = await request.json();




  const category = await prisma.category.update({

    where: {

      id,

    },


    data: {


      ...(body.name !== undefined && {

        name: body.name,

      }),



      ...(body.active !== undefined && {

        active: body.active,

      }),



    },


  });





  return NextResponse.json(category);


}