const GOOGLE_IDENTITY_SCRIPT = "https://accounts.google.com/gsi/client";
const GMAIL_READONLY_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";

let googleIdentityPromise: Promise<void> | null = null;

function createGoogleScriptPromise() {
  return new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${GOOGLE_IDENTITY_SCRIPT}"]`,
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Failed to load Google Identity Services.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = GOOGLE_IDENTITY_SCRIPT;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Identity Services."));
    document.head.appendChild(script);
  });
}

export async function ensureGoogleIdentity() {
  if (!googleIdentityPromise) {
    googleIdentityPromise = createGoogleScriptPromise();
  }

  await googleIdentityPromise;
}

export async function requestGoogleAccessToken(clientId: string) {
  await ensureGoogleIdentity();

  return new Promise<string>((resolve, reject) => {
    const tokenClient = window.google?.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: GMAIL_READONLY_SCOPE,
      prompt: "consent",
      callback: (response) => {
        if (!response.access_token) {
          reject(new Error(response.error_description || response.error || "Google login failed."));
          return;
        }

        resolve(response.access_token);
      },
      error_callback: () => {
        reject(new Error("Google login was interrupted."));
      },
    });

    if (!tokenClient) {
      reject(new Error("Google Identity Services is unavailable."));
      return;
    }

    tokenClient.requestAccessToken({
      prompt: "consent",
    });
  });
}

export function revokeGoogleAccessToken(accessToken: string) {
  window.google?.accounts.oauth2.revoke(accessToken);
}
