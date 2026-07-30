import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";


export async function POST(
  request: Request
) {


  const body = await request.json();


  const { url } = body;



  if (!url || !url.startsWith("/uploads")) {


    return NextResponse.json({

      error:"Geçersiz dosya"

    },{
      status:400
    });


  }




  const filePath = path.join(
    process.cwd(),
    "public",
    url
  );



  try {


    await fs.unlink(filePath);



    return NextResponse.json({

      success:true

    });



  } catch {


    return NextResponse.json({

      success:false

    });



  }


}