// src/pages/api/auth/logout.ts
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ cookies }) => {
  // Supprimer la session cookie
  cookies.delete("sessionId", { path: "/" });

  return new Response(
    JSON.stringify({ message: "Déconnexion réussie" }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
};
