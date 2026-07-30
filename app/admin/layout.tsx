import Link from "next/link";


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {


  return (

    <div className="min-h-screen bg-gray-100 flex">


      <aside className="w-64 bg-black text-white p-6 hidden md:block">


        <h1 className="text-2xl font-bold mb-10">
          NONNA
        </h1>





        <nav className="space-y-6">



          <div>


            <p className="text-gray-400 text-sm mb-2">
              YÖNETİM
            </p>


            <Link

              href="/admin"

              className="block p-3 rounded hover:bg-gray-800"

            >

              🏠 Dashboard

            </Link>


          </div>








          <div>


            <p className="text-gray-400 text-sm mb-2">
              MENÜ YÖNETİMİ
            </p>



            <Link

              href="/admin/products"

              className="block p-3 rounded hover:bg-gray-800"

            >

              🍕 Ürünler

            </Link>




            <Link

              href="/admin/categories"

              className="block p-3 rounded hover:bg-gray-800"

            >

              📂 Kategoriler

            </Link>




          </div>









          <div>


            <p className="text-gray-400 text-sm mb-2">
              İŞLETME
            </p>



            <Link

              href="/admin/settings"

              className="block p-3 rounded hover:bg-gray-800"

            >

              🏢 İşletme Ayarları

            </Link>



          </div>









          <div>


            <p className="text-gray-400 text-sm mb-2">
              GELECEK MODÜLLER
            </p>



            <div className="text-gray-500 p-3">

              🧾 Sipariş

            </div>


            <div className="text-gray-500 p-3">

              📦 Stok

            </div>


            <div className="text-gray-500 p-3">

              💰 Kasa

            </div>


            <div className="text-gray-500 p-3">

              👥 Personel

            </div>



          </div>





        </nav>



      </aside>









      <main className="flex-1 p-6">


        {children}


      </main>





    </div>

  );

}