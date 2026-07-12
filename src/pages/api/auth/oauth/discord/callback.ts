// src/pages/api/auth/oauth/discord/callback.ts
import type { APIRoute } from "astro";
import { exchangeCodeForToken, getDiscordUser } from "@lib/oauth/discord";

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  // Gestion des erreurs Discord
  if (error) {
    console.error("Discord OAuth error:", error);
    return redirect("/login?error=discord_auth_failed");
  }

  if (!code) {
    return redirect("/login?error=missing_code");
  }

  try {
    // 1. Échanger le code contre un token
    const tokenData = await exchangeCodeForToken(code);

    // 2. Récupérer les infos utilisateur Discord
    const discordUser = await getDiscordUser(tokenData.access_token);

    // 3. TODO: Chercher ou créer l'utilisateur en base de données
    // const user = await findOrCreateUser({
    //   discordId: discordUser.id,
    //   email: discordUser.email,
    //   username: discordUser.username,
    //   avatar: discordUser.avatar,
    // });

    // 4. Créer une session (JWT ou session cookie)
    const sessionToken = btoa(
      JSON.stringify({
        userId: discordUser.id,
        email: discordUser.email,
        username: discordUser.username,
        iat: Date.now(),
      })
    );

    // 5. Stocker le sessionToken dans un cookie httpOnly
    cookies.set("sessionId", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: "/",
    });

    // 6. Rediriger vers le dashboard
    return redirect("/");
  } catch (error) {
    console.error("OAuth callback error:", error);
    return redirect("/login?error=callback_failed");
  }
};
