export const dynamic = "force-dynamic";


import { prisma } from "@/app/lib/prisma";



export default async function MenuPage(){



  const products = await prisma.product.findMany({


    where:{

      active:true,

      available:true,

    },



    include:{

      category:true,

    },



    orderBy:[

      {

        category:{

          name:"asc",

        },

      },

      {

        sortOrder:"asc",

      },

    ],


  });







  const categories = Array.from(


    new Set(

      products.map(

        p => p.category.name

      )

    )


  );








  return (



    <main className="min-h-screen bg-white p-6">



      <div className="max-w-4xl mx-auto">



        <h1 className="text-4xl font-bold text-center mb-8">


          NONNA


        </h1>








        {

          categories.map((category)=>(



            <section

              key={category}

              className="mb-10"

            >





              <h2 className="text-2xl font-bold mb-4">


                {category}


              </h2>









              <div className="grid gap-4">





                {

                  products


                  .filter(

                    p => p.category.name === category

                  )


                  .map(product => (






                    <div


                      key={product.id}


                      className="flex gap-4 border rounded-xl p-4"


                    >







                      {


                        product.image &&



                        <img


                          src={product.image}


                          alt={product.name}


                          className="w-24 h-24 rounded-lg object-cover"


                        />


                      }









                      <div className="flex-1">





                        <h3 className="font-bold text-lg">


                          {product.name}


                        </h3>







                        {


                          product.description &&




                          <p className="text-gray-500 text-sm">


                            {product.description}


                          </p>



                        }






                      </div>









                      <div className="font-bold">


                        {product.price} TL


                      </div>






                    </div>






                  ))


                }





              </div>





            </section>





          ))


        }






      </div>





    </main>



  );



}