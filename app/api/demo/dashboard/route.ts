import { NextResponse } from "next/server"
import demoFixture from "@/lib/demo-data/dashboard-fixture.json"

export async function GET() {
  return NextResponse.json(demoFixture)
}
