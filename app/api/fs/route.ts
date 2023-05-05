import * as fs from "fs";
import { NextResponse } from "next/server";
export function GET() {
  const files = fs.readdirSync("public/html");
  return NextResponse.json(files);
}
