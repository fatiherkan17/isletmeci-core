"use client";

import { useEffect, useState } from "react";


type Category = {

  id: string;

  name: string;

  active: boolean;

  sortOrder: number;

};





export default function CategoriesPage() {


  const [categories, setCategories] = useState<Category[]>([]);

  const [name, setName] = useState("");

  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState("");

  const [editingName, setEditingName] = useState("");






  async function loadCategories() {


    const res = await fetch("/api/categories");


    const data = await res.json();


    setCategories(data);


  }







  useEffect(() => {


    loadCategories();


  }, []);










  async function addCategory(
    e: React.FormEvent
  ) {


    e.preventDefault();


    if (!name.trim()) return;




    setLoading(true);



    await fetch("/api/categories", {


      method: "POST",


      headers: {


        "Content-Type": "application/json",


      },


      body: JSON.stringify({


        name: name.trim(),


      }),


    });




    setName("");

    await loadCategories();

    setLoading(false);



  }









  async function updateCategory(
    id:string
  ) {


    if (!editingName.trim()) return;



    await fetch(`/api/categories/${id}`, {


      method:"PUT",


      headers:{


        "Content-Type":"application/json",


      },


      body:JSON.stringify({


        name: editingName.trim(),


      }),


    });




    setEditingId("");

    setEditingName("");

    loadCategories();



  }











  async function toggleCategory(

    id:string,

    active:boolean

  ) {



    await fetch(`/api/categories/${id}`, {


      method:"PUT",


      headers:{


        "Content-Type":"application/json",


      },


      body:JSON.stringify({


        active:!active,


      }),


    });




    loadCategories();


  }











  async function reorderCategory(

    id:string,

    direction:"up"|"down"

  ){



    await fetch("/api/categories/reorder",{


      method:"POST",


      headers:{


        "Content-Type":"application/json",


      },


      body:JSON.stringify({


        categoryId:id,


        direction,


      }),


    });




    loadCategories();



  }









  return (


    <main className="min-h-screen bg-gray-100 p-8">



      <div className="max-w-5xl mx-auto">



        <h1 className="text-3xl font-bold mb-8">

          Kategori Yönetimi

        </h1>







        <div className="bg-white rounded-xl shadow p-6 mb-8">


          <h2 className="font-bold mb-4">

            Yeni Kategori

          </h2>




          <form

            onSubmit={addCategory}

            className="flex gap-3"

          >


            <input


              className="border p-3 rounded flex-1"


              placeholder="Kategori adı"


              value={name}


              onChange={(e)=>setName(e.target.value)}


            />



            <button


              disabled={loading}


              className="bg-black text-white px-6 rounded"


            >


              {loading ? "Ekleniyor..." : "Ekle"}



            </button>



          </form>



        </div>











        <div className="bg-white rounded-xl shadow overflow-hidden">





          {categories.map((cat)=>(



            <div

              key={cat.id}

              className="border-b p-5 flex justify-between items-center"

            >





              <div>



                {editingId === cat.id ? (



                  <input


                    className="border p-2 rounded"


                    value={editingName}


                    onChange={(e)=>setEditingName(e.target.value)}


                  />


                ) : (



                  <div className="font-bold text-lg">

                    {cat.name}

                  </div>


                )}






                <div className="text-sm text-gray-500">

                  Menü sırası: {cat.sortOrder}

                </div>




              </div>









              <div className="flex gap-2 items-center flex-wrap">





                <button

                  onClick={()=>reorderCategory(cat.id,"up")}

                  className="bg-green-600 text-white px-3 py-2 rounded"

                >

                  ↑

                </button>





                <button

                  onClick={()=>reorderCategory(cat.id,"down")}

                  className="bg-orange-500 text-white px-3 py-2 rounded"

                >

                  ↓

                </button>







                {editingId === cat.id ? (


                  <button

                    onClick={()=>updateCategory(cat.id)}

                    className="bg-blue-600 text-white px-4 py-2 rounded"

                  >

                    Kaydet

                  </button>



                ) : (



                  <button

                    onClick={()=>{

                      setEditingId(cat.id);

                      setEditingName(cat.name);

                    }}

                    className="bg-blue-600 text-white px-4 py-2 rounded"

                  >

                    Düzenle

                  </button>



                )}









                <span

                  className={

                    cat.active

                    ? "text-green-600 font-bold"

                    : "text-red-600 font-bold"

                  }

                >

                  {cat.active ? "Aktif" : "Pasif"}

                </span>







                <button

                  onClick={()=>toggleCategory(cat.id,cat.active)}

                  className="bg-gray-800 text-white px-4 py-2 rounded"

                >

                  {cat.active ? "Pasif Yap" : "Aktif Yap"}

                </button>






              </div>





            </div>



          ))}





        </div>





      </div>





    </main>


  );


}