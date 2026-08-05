import { prisma } from "@/app/lib/prisma";


export default async function Home() {


  const settings = await prisma.setting.findFirst();



  const categories = await prisma.category.findMany({


    where: {


      active: true,


      products: {


        some: {


          active: true,

          available: true,


        },


      },


    },


    orderBy: {


      sortOrder: "asc",


    },


    include: {


      products: {


        where: {


          active: true,

          available: true,


        },


        orderBy: [


          {

            sortOrder: "asc",

          },


          {

            name: "asc",

          },


        ],


      },


    },


  });






  return (


    <main className="min-h-screen bg-[#faf7f2]">


      <div className="max-w-xl mx-auto px-4 py-6">





        <header className="text-center mb-8">



          {settings?.logo && (


            <img


              src={settings.logo}


              alt={settings.businessName}


              className="w-32 h-32 mx-auto rounded-full object-cover shadow"


            />


          )}






          <h1 className="text-3xl font-bold mt-5 text-[#2b1b12]">


            {settings?.businessName || "Nonna"}


          </h1>






          {settings?.slogan && (


            <p className="text-[#5f4b3d] mt-2 font-medium">


              {settings.slogan}


            </p>


          )}



        </header>









        <div className="sticky top-0 bg-[#faf7f2] py-3 z-20">



          <div className="flex gap-2 overflow-x-auto pb-2">





            {categories.map((category)=>(


              <a


                key={category.id}


                href={`#${category.id}`}


                className="bg-white border border-[#cdbfaf] rounded-full px-4 py-2 text-sm whitespace-nowrap shadow-sm text-[#2b1b12] font-semibold"


              >


                {category.name}


              </a>



            ))}




          </div>



        </div>









        {categories.map((category)=>(



          <section


            key={category.id}


            id={category.id}


            className="mt-8"


          >






            <h2 className="text-2xl font-bold mb-5 text-[#2b1b12]">


              {category.name}


            </h2>








            <div className="space-y-5">





              {category.products.map((product)=>(




                <div


                  key={product.id}


                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#eee3d8]"


                >






                  {product.image && (


                    <img


                      src={product.image}


                      alt={product.name}


                      className="w-full aspect-[4/3] object-cover"


                    />


                  )}








                  <div className="p-5">







                    {product.featured && (


                      <span className="inline-block bg-[#2b1b12] text-white text-xs px-3 py-1 rounded-full mb-3">


                        ⭐ Önerilen


                      </span>



                    )}









                    <div className="flex justify-between gap-4">





                      <h3 className="font-bold text-lg text-[#2b1b12]">


                        {product.name}


                      </h3>







                      <span className="font-bold text-lg text-[#2b1b12] whitespace-nowrap">


                        {product.price} TL


                      </span>






                    </div>









                    {product.description && (


                      <p className="text-sm text-[#5f4b3d] mt-3 leading-relaxed">


                        {product.description}


                      </p>



                    )}






                  </div>





                </div>





              ))}





            </div>







          </section>




        ))}






      </div>





    </main>


  );


}