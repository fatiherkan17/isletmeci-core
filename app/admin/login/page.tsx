"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";


export default function LoginPage(){


  const router = useRouter();


  const [email,setEmail] = useState("");

  const [password,setPassword] = useState("");

  const [error,setError] = useState("");

  const [loading,setLoading] = useState(false);




  async function login(e:React.FormEvent){

    e.preventDefault();

    setLoading(true);

    setError("");



    const res = await fetch("/api/auth/login",{

      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },

      body:JSON.stringify({

        email,

        password

      })

    });



    const data = await res.json();



    if(!res.ok){

      setError(data.error || "Giriş başarısız");

      setLoading(false);

      return;

    }



    router.push("/admin");


  }






  return (

    <main className="min-h-screen bg-gray-100 flex items-center justify-center">


      <form

        onSubmit={login}

        className="bg-white p-8 rounded-xl shadow w-full max-w-md space-y-4"

      >


        <h1 className="text-2xl font-bold text-center">

          NONNA Yönetim

        </h1>



        <input

          className="w-full border p-3 rounded"

          placeholder="E-posta"

          value={email}

          onChange={(e)=>setEmail(e.target.value)}

        />



        <input

          className="w-full border p-3 rounded"

          type="password"

          placeholder="Şifre"

          value={password}

          onChange={(e)=>setPassword(e.target.value)}

        />



        {error && (

          <p className="text-red-600">

            {error}

          </p>

        )}



        <button

          disabled={loading}

          className="w-full bg-black text-white p-3 rounded"

        >

          {loading ? "Giriş..." : "Giriş Yap"}

        </button>



      </form>


    </main>

  );


}