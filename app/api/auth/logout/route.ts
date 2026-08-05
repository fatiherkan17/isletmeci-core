import { NextResponse } from "next/server";


export async function POST(request: Request) {


  const response = NextResponse.redirect(
    new URL("/login", request.url)
  );


  response.cookies.set({

    name: "nonna_session",

    value: "",

    httpOnly: true,

    expires: new Date(0),

    path: "/",

  });


  return response;


}