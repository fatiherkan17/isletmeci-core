import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import {
  createUser,
  toggleUserStatus
} from "@/app/actions/user";


export default async function UsersPage(){


  const users = await prisma.user.findMany({

    orderBy:{
      createdAt:"desc"
    }

  });



  return (

    <main className="p-8">


      <h1 className="text-3xl font-bold mb-6">
        Personel Yönetimi
      </h1>




      <form

        action={createUser}

        className="bg-white p-6 rounded-xl shadow mb-8 space-y-3"

      >


        <input

          name="name"

          placeholder="Ad Soyad"

          className="border p-3 rounded w-full"

        />



        <input

          name="email"

          placeholder="E-posta"

          className="border p-3 rounded w-full"

        />



        <input

          name="password"

          type="password"

          placeholder="Şifre"

          className="border p-3 rounded w-full"

        />



        <select

          name="role"

          className="border p-3 rounded w-full"

        >

          <option value="STAFF">
            Personel
          </option>


          <option value="MANAGER">
            Müdür
          </option>


        </select>



        <button

          className="bg-black text-white px-5 py-3 rounded"

        >

          Personel Ekle

        </button>



      </form>





      <div className="bg-white rounded-xl shadow overflow-hidden">


        <table className="w-full">


          <thead className="bg-gray-200">

            <tr>


              <th className="p-3 text-left">
                Ad
              </th>


              <th className="p-3 text-left">
                Mail
              </th>


              <th className="p-3 text-left">
                Rol
              </th>


              <th className="p-3 text-left">
                Durum
              </th>


              <th className="p-3">
                İşlem
              </th>


            </tr>

          </thead>





          <tbody>


          {

            users.map((user)=>(


              <tr

                key={user.id}

                className="border-t"

              >



                <td className="p-3">

                  {user.name}

                </td>




                <td className="p-3">

                  {user.email}

                </td>




                <td className="p-3">

                  {user.role}

                </td>




                <td className="p-3">

                  {

                    user.active

                    ?

                    "Aktif"

                    :

                    "Pasif"

                  }

                </td>




                <td className="p-3 flex gap-2">


                  <Link

                    href={`/admin/users/${user.id}/permissions`}

                    className="bg-blue-600 text-white px-3 py-2 rounded"

                  >

                    Yetkiler

                  </Link>





                  <form action={toggleUserStatus}>


                    <input

                      type="hidden"

                      name="id"

                      value={user.id}

                    />


                    <button

                      className="bg-gray-800 text-white px-3 py-2 rounded"

                    >

                      Değiştir

                    </button>


                  </form>



                </td>



              </tr>


            ))

          }


          </tbody>



        </table>



      </div>



    </main>

  );


}