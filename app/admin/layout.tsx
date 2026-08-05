import Link from "next/link";
import { getSession } from "@/app/lib/auth";
import { redirect } from "next/navigation";


export default async function AdminLayout({

  children,

}: {

  children: React.ReactNode;

}) {


  const session = await getSession();


  if (!session) {

    redirect("/login");

  }


  const userEmail = session.email as string;
  const userRole = session.role as string;



  return (

    <div className="min-h-screen bg-gray-100 flex">


      <aside className="w-64 bg-black text-white p-6 hidden md:block">


        <h1 className="text-2xl font-bold mb-4">
          NONNA
        </h1>



        <div className="mb-8 text-sm text-gray-300">


          <div>
            👤 {userEmail}
          </div>


          <div className="mt-1 text-green-400">
            🔑 {userRole}
          </div>



          <form action="/api/auth/logout" method="POST">


            <button

              type="submit"

              className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white rounded px-3 py-2 text-sm"

            >

              🚪 Çıkış Yap

            </button>


          </form>


        </div>






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



            {


            userRole === "OWNER" && (


              <Link

                href="/admin/users"

                className="block p-3 rounded hover:bg-gray-800"

              >

                👥 Personel

              </Link>


            )


            }



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