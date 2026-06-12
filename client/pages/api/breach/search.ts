// pages/api/breach/search.ts
// ─────────────────────────────────────────────────────────────────────────────
// Installe le client Turso si ce n'est pas déjà fait :
//   npm install @libsql/client
//
// Dans ton .env.local (à la racine du projet) :
//   TURSO_DATABASE_URL=libsql://anka-anka.aws-us-east-1.turso.io
//   TURSO_AUTH_TOKEN=<ton token depuis app.turso.tech → database → Generate Token>
// ─────────────────────────────────────────────────────────────────────────────

import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@libsql/client";

// ── Client Turso (singleton par process) ─────────────────────────────────────
const turso = createClient({
  url:       process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

// ── Colonnes réelles de ta table symamobile ───────────────────────────────────
// Clés = "key" des champs dans TAB_FIELDS côté frontend
// Valeurs = noms exacts des colonnes dans Turso
const KEY_TO_COLUMN: Record<string, string> = {
  // Tab Contact
  email:    "email",
  phone:    "msisdn",      // le numéro de téléphone est stocké dans msisdn
  // Tab Identity
  firstName:  "prenom",
  lastName:   "nom",
  // Tab Address
  street:   "adresse",
  zip:      "code_postal",
  city:     "ville",
  // Ajoute ici d'autres mappings si tu crées d'autres tables plus tard
};

// ── Opérateurs SQL selon le mode CONT ────────────────────────────────────────
function buildClause(col: string, cont: string, val: string): { sql: string; arg: string } {
  switch (cont) {
    case "EQ":    return { sql: `${col} = ?`,         arg: val };
    case "START": return { sql: `${col} LIKE ?`,      arg: `${val}%` };
    case "END":   return { sql: `${col} LIKE ?`,      arg: `%${val}` };
    case "CONT":
    default:      return { sql: `${col} LIKE ?`,      arg: `%${val}%` };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { values, conts } = req.body as {
    table:  string;                      // ignoré pour l'instant (une seule table)
    values: Record<string, string>;
    conts:  Record<string, string>;
  };

  // ── Filtrer les champs non-vides avec une colonne connue ──────────────────
  const filters = Object.entries(values || {}).filter(
    ([key, val]) => val && val.trim() !== "" && KEY_TO_COLUMN[key]
  );

  if (filters.length === 0) {
    return res.status(400).json({ error: "Au moins un champ requis" });
  }

  // ── Construire la requête SQL dynamique ───────────────────────────────────
  const clauses: string[]  = [];
  const args:    string[]  = [];

  for (const [key, val] of filters) {
    const col  = KEY_TO_COLUMN[key];
    const cont = conts?.[key] || "CONT";
    const { sql, arg } = buildClause(col, cont, val.trim());
    clauses.push(sql);
    args.push(arg);
  }

  const sql = `SELECT msisdn, nom, prenom, email, adresse, code_postal, ville
               FROM symamobile
               WHERE ${clauses.join(" AND ")}
               LIMIT 100`;

  try {
    const result = await turso.execute({ sql, args });

    if (result.rows.length === 0) {
      return res.status(200).json({ results: [] });
    }

    // Convertir les rows Turso en objets JSON propres
    const rows = result.rows.map(row => ({
      msisdn:      row.msisdn,
      nom:         row.nom,
      prenom:      row.prenom,
      email:       row.email,
      adresse:     row.adresse,
      code_postal: row.code_postal,
      ville:       row.ville,
    }));

    return res.status(200).json({ results: rows });
  } catch (err: any) {
    console.error("[Turso search error]", err);
    return res.status(500).json({ error: "Erreur base de données" });
  }
}
