import { createClient, Client } from "@libsql/client";

// Singleton — évite de recréer une connexion à chaque appel API
let client: Client | null = null;

export function getTursoClient(): Client {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
      throw new Error(
        "TURSO_DATABASE_URL ou TURSO_AUTH_TOKEN manquant dans les variables d'environnement (.env.local)"
      );
    }

    client = createClient({ url, authToken });
  }
  return client;
}