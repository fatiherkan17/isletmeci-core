import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";


const supabase = createClient(

  process.env.NEXT_PUBLIC_SUPABASE_URL!,

  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

);



export async function POST(request: Request) {


  try {


    const formData = await request.formData();


    const file = formData.get("file") as File;



    if (!file) {


      return NextResponse.json(

        {
          error: "Dosya bulunamadı"
        },

        {
          status:400
        }

      );


    }





    const bytes = await file.arrayBuffer();


    const buffer = Buffer.from(bytes);





    const fileName =

      `${Date.now()}-${file.name.replace(/\s/g,"-")}`;







    const { error } = await supabase.storage

      .from("product-images")

      .upload(

        fileName,

        buffer,

        {

          contentType:file.type,

          upsert:false

        }

      );






    if(error){


      console.error(error);


      return NextResponse.json(

        {
          error:"Fotoğraf yüklenemedi"
        },

        {
          status:500
        }

      );


    }







    const { data } = supabase.storage

      .from("product-images")

      .getPublicUrl(fileName);








    return NextResponse.json({

      url:data.publicUrl

    });





  }

  catch(error){



    console.error(error);



    return NextResponse.json(

      {
        error:"Sunucu hatası"
      },

      {
        status:500
      }

    );


  }


}