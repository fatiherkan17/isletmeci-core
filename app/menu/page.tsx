export const dynamic = "force-dynamic";

import { prisma } from "@/app/lib/prisma";
import Link from "next/link";


export default async function MenuPage() {


  const tables = await prisma.table.findMany({

    where: {

      active: true,

    },

    orderBy: {

      number: "asc",

    },

  });



  const setting = await prisma.setting.findFirst();




  return (

    <main className="
      min-h-screen
      bg-[#F8F3EA]
      text-[#1F2A1F]
      p-5
    ">



      <div className="
        max-w-md
        mx-auto
      ">





        {/* HEADER */}


        <section className="
          text-center
          pt-8
          pb-6
        ">


          {
            setting?.logo && (

              <img

                src={setting.logo}

                alt="NONNA"

                className="
                  w-32
                  h-32
                  mx-auto
                  rounded-full
                  object-cover
                  border-4
                  border-[#C9A227]
                  shadow-lg
                  mb-5
                "

              />

            )
          }





          <h1 className="
            text-5xl
            font-bold
            tracking-wide
          ">


            {
              setting?.businessName
              ??
              "NONNA"
            }


          </h1>





          <p className="
            mt-3
            text-[#C65D3A]
            text-lg
            font-medium
          ">


            {
              setting?.slogan
              ??
              "Authentic Italian Kitchen"
            }


          </p>





          {
            setting?.address && (

              <p className="
                mt-3
                text-sm
                text-gray-600
              ">

                📍 {setting.address}

              </p>

            )
          }





          <div className="
            mt-5
            bg-white
            rounded-2xl
            p-4
            border
            border-[#E8DCC8]
            shadow-sm
          ">


            <p className="
              text-sm
              leading-relaxed
              text-gray-600
            ">


              İtalyan mutfağının sıcaklığı,
              <br/>
              Çanakkale Kordon'un eşsiz atmosferiyle buluşuyor.


            </p>


          </div>




        </section>








        {/* BRAND CARDS */}



        <div className="
          grid
          grid-cols-3
          gap-3
          mb-8
        ">


          <div className="
            bg-white
            rounded-2xl
            p-4
            text-center
            border
            border-[#E8DCC8]
          ">


            <div className="text-3xl">

              🍕

            </div>


            <p className="
              text-xs
              mt-2
              font-bold
            ">

              Napoli Pizza

            </p>


          </div>






          <div className="
            bg-white
            rounded-2xl
            p-4
            text-center
            border
            border-[#E8DCC8]
          ">


            <div className="text-3xl">

              ☕

            </div>


            <p className="
              text-xs
              mt-2
              font-bold
            ">

              Özel Kahve

            </p>


          </div>






          <div className="
            bg-white
            rounded-2xl
            p-4
            text-center
            border
            border-[#E8DCC8]
          ">


            <div className="text-3xl">

              🥐

            </div>


            <p className="
              text-xs
              mt-2
              font-bold
            ">

              Kahvaltı

            </p>


          </div>


        </div>









        {/* INFO CARDS */}



        <div className="
          space-y-4
          mb-10
        ">




          {
            setting?.instagram && (


              <a

                href={setting.instagram}

                target="_blank"

                className="
                  bg-white
                  rounded-2xl
                  p-5
                  border
                  border-[#E8DCC8]
                  shadow-sm
                  flex
                  items-center
                  gap-4
                "

              >


                <div className="text-3xl">

                  📸

                </div>


                <div>

                  <div className="
                    font-bold
                  ">

                    Instagram

                  </div>


                  <div className="
                    text-sm
                    text-gray-500
                  ">

                    Lezzetlerimizi keşfedin

                  </div>


                </div>


              </a>


            )

          }







          <div className="
            bg-white
            rounded-2xl
            p-5
            border
            border-[#E8DCC8]
            shadow-sm
            flex
            items-center
            gap-4
          ">


            <div className="text-3xl">

              📶

            </div>


            <div>

              <div className="font-bold">

                WiFi

              </div>


              <div className="
                text-sm
                text-gray-500
              ">

                Şifre için personelimize danışabilirsiniz

              </div>


            </div>


          </div>







          {
            setting?.workingHours && (


              <div className="
                bg-white
                rounded-2xl
                p-5
                border
                border-[#E8DCC8]
                shadow-sm
                flex
                items-center
                gap-4
              ">


                <div className="text-3xl">

                  🕒

                </div>


                <div>

                  <div className="font-bold">

                    Çalışma Saatleri

                  </div>


                  <div className="
                    text-sm
                    text-gray-500
                  ">

                    {setting.workingHours}

                  </div>


                </div>


              </div>


            )

          }


        </div>









        {/* TABLE SELECT */}



        <section>


          <div className="
            text-center
            mb-6
          ">


            <h2 className="
              text-2xl
              font-bold
            ">

              Hoş geldiniz 👋

            </h2>



            <p className="
              mt-2
              text-gray-600
            ">

              Masanızı seçerek menümüze ulaşabilirsiniz

            </p>


          </div>







          <div className="
            grid
            grid-cols-3
            gap-4
          ">



            {
              tables.map((table)=>(


                <Link

                  key={table.id}

                  href={`/menu/${table.number}`}


                  className="
                    h-24
                    rounded-2xl
                    bg-[#1F2A1F]
                    text-white
                    flex
                    flex-col
                    items-center
                    justify-center
                    shadow-md
                    border
                    border-[#C9A227]
                    transition
                    hover:bg-[#C65D3A]
                  "

                >

                  <span className="
                    text-xs
                    opacity-80
                  ">

                    Masa

                  </span>


                  <span className="
                    text-3xl
                    font-bold
                  ">

                    {table.number}

                  </span>


                </Link>


              ))

            }


          </div>



        </section>








        <footer className="
          text-center
          mt-12
          text-sm
          text-gray-500
        ">


          NONNA ©


        </footer>





      </div>



    </main>

  );


}