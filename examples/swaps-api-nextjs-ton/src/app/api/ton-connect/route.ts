import { NextResponse } from "next/server";

export async function GET() {
  const manifest = {
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    name: process.env.NEXT_PUBLIC_APP_NAME || "My TON App",
    iconUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/app-icon.png`,
  };

  return NextResponse.json(manifest);
}
