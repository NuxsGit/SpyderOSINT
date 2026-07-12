// src/pages/api/auth/register.ts
import type { APIRoute } from "astro";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request, cookies }) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ message: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { email, password } = await request.json();

    // Validation basique
    if (!email || !password) {
      return new Response(
        JSON.stringify({ message: "Email et mot de passe requis" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!EMAIL_PATTERN.test(email)) {
      return new Response(JSON.stringify({ message: "Email invalide" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (password.length < 8) {
      return new Response(
        JSON.stringify({
          message: "Le mot de passe doit contenir au moins 8 caractères",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // TODO: Implémenter la création d'utilisateur en base de données
    // const user = await db.users.create({
    //   data: {
    //     email,
    //     password: await hashPassword(password),
    //   },
    // });

    // Créer une session simple pour la démo
    const sessionToken = btoa(
      JSON.stringify({
        userId: "user-" + Date.now(),
        email,
        iat: Date.now(),
      })
    );

    cookies.set("sessionId", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return new Response(
      JSON.stringify({
        message: "Inscription réussie",
        userId: "user-" + Date.now(),
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return new Response(JSON.stringify({ message: "Erreur serveur" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
