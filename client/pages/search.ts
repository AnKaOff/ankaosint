import type { NextApiRequest, NextApiResponse } from "next";
import { getTursoClient } from "../../../lib/turso";

// ── Opérateurs de comparaison disponibles dans le frontend ─────────
// CONT  -> contient   (LIKE '%val%')
// EQ    -> égal       (= val)
// START -> commence par (LIKE 'val%')
// END   -> finit par    (LIKE '%val')
const OP_MAP: Record<string, (col: string) => string> = {
  EQ:    (c) => `${c} = ?`,
  START: (c) => `${c} LIKE ? || '%'`,
  END:   (c) => `${c} LIKE '%' || ?`,
  CONT:  (c) => `${c} LIKE '%' || ? || '%'`,
};

// ── Tables autorisées — whitelist pour éviter l'injection SQL via
// le nom de table (qui ne peut pas être paramétré avec ?) ──────────
const ALLOWED_TABLES = new Set([
  "identity",
  "contact",
  "address",
  "birth",
  "financial",
  "credentials",
  "identifiers",
]);

// ── Colonnes autorisées par table — whitelist pour éviter l'injection
// via les noms de colonnes (eux non plus ne peuvent pas être ? params).
// Adapte cette liste aux colonnes réelles de tes tables Turso.
const ALLOWED_COLUMNS: Record<string, Set<string>> = {
  identity: new Set(["firstName","lastName","birthName","displayName","username","gender"]),
  contact:  new Set(["email","phone","ip","domain"]),
  address:  new Set(["street","city","state","zip","country"]),
  birth:    new Set(["dob","age","birthCity","birthCountry"]),
  financial: new Set(["cc","iban","bank"]),
  credentials: new Set(["password","hash","salt"]),
  identifiers: new Set(["userId","ssn","passport","license"]),
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { table, values, conts } = req.body as {
      table?: string;
      values?: Record<string, string>;
      conts?: Record<string, string>;
    };

    if (!table || !ALLOWED_TABLES.has(table)) {
      return res.status(400).json({ error: "Table invalide ou manquante" });
    }

    const allowedCols = ALLOWED_COLUMNS[table];
    const conditions: string[] = [];
    const params: string[] = [];

    for (const [key, rawVal] of Object.entries(values || {})) {
      const val = (rawVal ?? "").trim();
      if (!val) continue;

      if (!allowedCols.has(key)) {
        // ignore silencieusement les clés inconnues plutôt que de planter
        continue;
      }

      const op = (conts && conts[key]) || "CONT";
      const buildCondition = OP_MAP[op] || OP_MAP.CONT;

      conditions.push(buildCondition(key));
      params.push(val);
    }

    if (conditions.length === 0) {
      return res.status(200).json({ results: [] });
    }

    const sql = `SELECT * FROM ${table} WHERE ${conditions.join(" AND ")} LIMIT 100`;

    const db = getTursoClient();
    const result = await db.execute({ sql, args: params });

    return res.status(200).json({ results: result.rows });
  } catch (err: any) {
    console.error("Breach search error:", err);
    return res.status(500).json({ error: err?.message || "Erreur serveur" });
  }
}