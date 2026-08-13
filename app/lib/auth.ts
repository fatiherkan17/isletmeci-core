import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("JWT_SECRET environment variable is required.");
}

const secret = new TextEncoder().encode(jwtSecret);

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("nonna_session")?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, secret);

    if (!payload.id || !payload.email || !payload.role) {
      return null;
    }

    return {
      id: String(payload.id),
      email: String(payload.email),
      role: String(payload.role).toUpperCase(),
    };
  } catch (error) {
    console.error("SESSION ERROR", error);
    return null;
  }
}
