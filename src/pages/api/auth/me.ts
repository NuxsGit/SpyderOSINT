// src/pages/api/auth/me.ts
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ cookies }) => {
  const sessionId = cookies.get("sessionId")?.value;

  if (!sessionId) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Décoder le token simple (en prod, utilise JWT avec vérification de signature)
    const userData = JSON.parse(atob(sessionId));

    return new Response(JSON.stringify(userData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Invalid session" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
};
