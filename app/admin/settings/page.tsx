"use client";

import { useEffect, useState } from "react";


type Settings = {

  id: string;

  businessName: string;

  slogan: string | null;

  logo: string | null;

  phone: string | null;

  address: string | null;

  instagram: string | null;

  workingHours: string | null;

};



export default function SettingsPage() {


  const [settings, setSettings] = useState<Settings | null>(null);

  const [uploading, setUploading] = useState(false);



  const [businessName, setBusinessName] = useState("");

  const [slogan, setSlogan] = useState("");

  const [logo, setLogo] = useState("");

  const [phone, setPhone] = useState("");

  const [address, setAddress] = useState("");

  const [instagram, setInstagram] = useState("");

  const [workingHours, setWorkingHours] = useState("");





  useEffect(() => {


    async function loadSettings() {


      const res = await fetch("/api/settings");


      const data = await res.json();



      setSettings(data);


      setBusinessName(data.businessName || "");

      setSlogan(data.slogan || "");

      setLogo(data.logo || "");

      setPhone(data.phone || "");

      setAddress(data.address || "");

      setInstagram(data.instagram || "");

      setWorkingHours(data.workingHours || "");


    }



    loadSettings();


  }, []);








  async function uploadImage(
    e: React.ChangeEvent<HTMLInputElement>
  ) {


    const file = e.target.files?.[0];


    if (!file) return;



    setUploading(true);



    const formData = new FormData();


    formData.append("file", file);




    const res = await fetch("/api/upload", {


      method: "POST",

      body: formData,


    });




    const data = await res.json();



    setLogo(data.url);



    setUploading(false);


  }








  async function saveSettings(
    e: React.FormEvent
  ) {


    e.preventDefault();



    await fetch("/api/settings", {


      method: "PUT",


      headers: {


        "Content-Type": "application/json",


      },


      body: JSON.stringify({


        businessName,

        slogan,

        logo,

        phone,

        address,

        instagram,

        workingHours,


      }),


    });



    alert("Ayarlar kaydedildi");


  }







  if (!settings) {


    return (

      <div className="p-10">

        Yükleniyor...

      </div>

    );

  }








  return (


    <main className="min-h-screen bg-gray-100 p-8">



      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6">



        <h1 className="text-2xl font-bold mb-6">

          İşletme Ayarları

        </h1>





        <form

          onSubmit={saveSettings}

          className="space-y-4"

        >





          <input

            className="w-full border p-3 rounded"

            placeholder="İşletme adı"

            value={businessName}

            onChange={(e)=>setBusinessName(e.target.value)}

          />





          <input

            className="w-full border p-3 rounded"

            placeholder="Slogan"

            value={slogan}

            onChange={(e)=>setSlogan(e.target.value)}

          />







          <div>


            <label className="font-semibold">

              Logo

            </label>



            {logo && (

              <img

                src={logo}

                alt="logo"

                className="w-32 h-32 object-cover rounded-full mt-3 mb-3"

              />

            )}



            <input

              type="file"

              accept="image/*"

              onChange={uploadImage}

            />


            {uploading && (

              <p>

                Yükleniyor...

              </p>

            )}


          </div>








          <input

            className="w-full border p-3 rounded"

            placeholder="Telefon"

            value={phone}

            onChange={(e)=>setPhone(e.target.value)}

          />







          <textarea

            className="w-full border p-3 rounded"

            placeholder="Adres"

            value={address}

            onChange={(e)=>setAddress(e.target.value)}

          />







          <input

            className="w-full border p-3 rounded"

            placeholder="Instagram"

            value={instagram}

            onChange={(e)=>setInstagram(e.target.value)}

          />







          <textarea

            className="w-full border p-3 rounded"

            placeholder="Çalışma saatleri"

            value={workingHours}

            onChange={(e)=>setWorkingHours(e.target.value)}

          />







          <button

            className="w-full bg-black text-white p-3 rounded"

          >

            Kaydet

          </button>





        </form>



      </div>



    </main>


  );


}