import { NextResponse } from "next/server";

export async function GET() {
  const manifest = {
    url: "http://localhost:3000",
    name: "Ton Bridge",
    iconUrl: `"http://localhost:3000/app-icon.png`,
  };

  return NextResponse.json(manifest);
}
