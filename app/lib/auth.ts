import { cookies } from "next/headers";
import { jwtVerify } from "jose";


const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "nonna-secret"
);



export async function getSession() {


  const cookieStore = await cookies();


  const token = cookieStore.get(
    "nonna_session"
  )?.value;



  if(!token){

    return null;

  }



  try {


    const { payload } = await jwtVerify(
      token,
      secret
    );


    return {

      id: String(payload.id),

      email: String(payload.email),

      role: String(payload.role).toUpperCase()

    };



  } catch(error){


    console.error("SESSION ERROR",error);


    return null;


  }


}