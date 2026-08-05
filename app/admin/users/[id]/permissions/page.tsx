import { prisma } from "@/app/lib/prisma";
import { togglePermission } from "@/app/actions/user";



export default async function PermissionsPage({

  params,

}: {

  params: Promise<{
    id:string
  }>

}) {



  const { id } = await params;




  const user = await prisma.user.findUnique({

    where:{
      id
    },

    include:{

      permissions:{

        include:{

          permission:true

        }

      }

    }

  });





  if(!user){

    return (

      <main className="p-8">

        <h1 className="text-2xl font-bold">
          Kullanıcı bulunamadı
        </h1>

      </main>

    );

  }





  const permissions = await prisma.permission.findMany({

    orderBy:{

      name:"asc"

    }

  });





  const activePermissions = user.permissions.map(

    (item)=>item.permissionId

  );






  return (

    <main className="p-8">



      <h1 className="text-3xl font-bold mb-2">

        {user.name}

      </h1>



      <p className="text-gray-500 mb-6">

        {user.email}

      </p>





      <div className="bg-white rounded-xl shadow p-6">



      {

        permissions.map((permission)=>(


          <div

            key={permission.id}

            className="flex items-center justify-between border-b py-4"

          >



            <div>


              <h2 className="font-bold">

                {permission.name}

              </h2>


              <p className="text-sm text-gray-500">

                Sistem yetkisi

              </p>


            </div>





            <form action={togglePermission}>


              <input

                type="hidden"

                name="userId"

                value={user.id}

              />



              <input

                type="hidden"

                name="permissionId"

                value={permission.id}

              />




              <button

                className={

                  activePermissions.includes(permission.id)

                  ?

                  "bg-green-600 text-white px-5 py-2 rounded"

                  :

                  "bg-gray-300 px-5 py-2 rounded"

                }

              >


                {

                  activePermissions.includes(permission.id)

                  ?

                  "Aktif"

                  :

                  "Pasif"

                }


              </button>



            </form>



          </div>


        ))

      }



      </div>




    </main>

  );


}