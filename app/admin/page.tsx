import { prisma } from "@/app/lib/prisma";


export default async function AdminPage() {


  const totalProducts = await prisma.product.count();


  const activeProducts = await prisma.product.count({

    where: {

      active: true,

    },

  });



  const totalCategories = await prisma.category.count();



  const activeCategories = await prisma.category.count({

    where: {

      active: true,

    },

  });




  return (


    <main>


      <h1 className="text-3xl font-bold mb-8">

        NONNA Yönetim

      </h1>




      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">



        <div className="bg-white rounded-xl shadow p-6">


          <p className="text-gray-500">

            Toplam Ürün

          </p>


          <h2 className="text-3xl font-bold mt-2">

            {totalProducts}

          </h2>


        </div>





        <div className="bg-white rounded-xl shadow p-6">


          <p className="text-gray-500">

            Aktif Ürün

          </p>


          <h2 className="text-3xl font-bold mt-2 text-green-600">

            {activeProducts}

          </h2>


        </div>






        <div className="bg-white rounded-xl shadow p-6">


          <p className="text-gray-500">

            Kategori

          </p>


          <h2 className="text-3xl font-bold mt-2">

            {totalCategories}

          </h2>


        </div>







        <div className="bg-white rounded-xl shadow p-6">


          <p className="text-gray-500">

            Menü Durumu

          </p>


          <h2 className="text-2xl font-bold mt-2 text-green-600">

            Aktif

          </h2>


        </div>




      </div>






      <div className="mt-8 bg-white rounded-xl shadow p-6">


        <h2 className="text-xl font-bold mb-3">

          Sistem Durumu

        </h2>


        <p className="text-gray-600">

          QR Menü aktif durumda.

        </p>


        <p className="text-gray-600">

          Ürün ve kategori yönetimi çalışıyor.

        </p>


      </div>




    </main>


  );


}