import { createClient } from "@libsql/client";
import { NextRequest, NextResponse } from "next/server";

const db = createClient({
  url: "libsql://anka-anka.aws-us-east-2.turso.io",
  authToken:
    "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicm8iLCJpYXQiOjE3ODEyNzg4OTIsImlkIjoiMDE5ZWJjNjgtODcwMS03ZTIyLTlmNzUtNDE5YzY1MTlmNmYzIiwicmlkIjoiMTIwOTYxYjEtNDhmNy00MWI3LTlhYjktYjdhOTBiMzA5NmZhIn0.lKMFjCaRTOrnrY51CwJeJTKRCvHHcOXdNFwHMf3b3cYD14tzl8e_nFcM0cfVHRHEJ6JT4VXXj-I1Cm3Y0KaCDQ",
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const result = await db.execute({
      sql: `SELECT * FROM symamobile 
            WHERE msisdn LIKE ?
            OR nom LIKE ?
            OR prenom LIKE ?
            OR email LIKE ?
            OR ville LIKE ?
            OR adresse LIKE ?
            OR piece_numero LIKE ?
            LIMIT 50`,
      args: Array(7).fill(`%${query}%`),
    });

    return NextResponse.json({ results: result.rows });
  } catch (err) {
    console.error("Turso query error:", err);
    return NextResponse.json({ error: "Erreur de base de données" }, { status: 500 });
  }
}
