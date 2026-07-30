import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";



export async function GET() {


  let settings = await prisma.setting.findFirst();



  if (!settings) {


    settings = await prisma.setting.create({

      data: {

        businessName: "Nonna",

        slogan: "Her tabakta bir hikaye",

      },

    });


  }



  return NextResponse.json(settings);


}







export async function PUT(request: Request) {


  const body = await request.json();



  let settings = await prisma.setting.findFirst();



  if (!settings) {


    settings = await prisma.setting.create({

      data: {

        businessName: body.businessName || "Nonna",

        slogan: body.slogan || "",

        logo: body.logo || "",

        phone: body.phone || "",

        address: body.address || "",

        instagram: body.instagram || "",

        workingHours: body.workingHours || "",

      },

    });



  } else {



    settings = await prisma.setting.update({

      where: {

        id: settings.id,

      },


      data: {

        businessName: body.businessName,

        slogan: body.slogan,

        logo: body.logo,

        phone: body.phone,

        address: body.address,

        instagram: body.instagram,

        workingHours: body.workingHours,

      },


    });


  }




  return NextResponse.json(settings);


}