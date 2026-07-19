// src/pages/api/auth/oauth/github/callback.ts
import type { APIRoute } from "astro";
import { exchangeCodeForToken, getGithubUser, getGithubPrimaryEmail } from "@lib/oauth/github";

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  // Gestion des erreurs GitHub
  if (error) {
    console.error("GitHub OAuth error:", error);
    return redirect("/login?error=github_auth_failed");
  }

  if (!code) {
    return redirect("/login?error=missing_code");
  }

  try {
    // 1. Échanger le code contre un token
    const tokenData = await exchangeCodeForToken(code);

    // 2. Récupérer les infos utilisateur GitHub
    const githubUser = await getGithubUser(tokenData.access_token);

    // 3. Récupérer l'email principal
    const email = await getGithubPrimaryEmail(tokenData.access_token);

    // 4. TODO: Chercher ou créer l'utilisateur en base de données
    // const user = await findOrCreateUser({
    //   githubId: String(githubUser.id),
    //   email: email,
    //   username: githubUser.login,
    //   avatar: githubUser.avatar_url,
    // });

    // 5. Créer une session (JWT ou session cookie)
    const sessionToken = btoa(
      JSON.stringify({
        userId: String(githubUser.id),
        email: email,
        username: githubUser.login,
        iat: Date.now(),
      })
    );

    // 6. Stocker le sessionToken dans un cookie httpOnly
    cookies.set("sessionId", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: "/",
    });

    // 7. Rediriger vers le dashboard
    return redirect("/");
  } catch (error) {
    console.error("OAuth callback error:", error);
    return redirect("/login?error=callback_failed");
  }
};