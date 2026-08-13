import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("JWT_SECRET environment variable is required.");
}

const secret = new TextEncoder().encode(jwtSecret);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "E-posta ve şifre gerekli" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 401 }
      );
    }

    if (!user.active) {
      return NextResponse.json(
        { error: "Kullanıcı hesabı pasif" },
        { status: 403 }
      );
    }

    const checkPassword = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!checkPassword) {
      return NextResponse.json(
        { error: "Şifre yanlış" },
        { status: 401 }
      );
    }

    const token = await new SignJWT({
      id: user.id,
      role: user.role,
      email: user.email,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    const response = NextResponse.json({ success: true });

    response.cookies.set({
      name: "nonna_session",
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
