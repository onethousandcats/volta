import { requestGoogleAccessToken, revokeGoogleAccessToken } from "../lib/googleIdentity";
import { useVoltaStore } from "../../../store/app-store";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export function LoginButton() {
  const accessToken = useVoltaStore((state) => state.accessToken);
  const authError = useVoltaStore((state) => state.authError);
  const isAuthLoading = useVoltaStore((state) => state.isAuthLoading);
  const logout = useVoltaStore((state) => state.logout);
  const setAccessToken = useVoltaStore((state) => state.setAccessToken);
  const setAuthError = useVoltaStore((state) => state.setAuthError);
  const setAuthLoading = useVoltaStore((state) => state.setAuthLoading);

  async function handleLogin() {
    if (!GOOGLE_CLIENT_ID) {
      setAuthError("Add VITE_GOOGLE_CLIENT_ID to enable Gmail login.");
      return;
    }

    setAuthLoading(true);
    setAuthError(null);

    try {
      const token = await requestGoogleAccessToken(GOOGLE_CLIENT_ID);
      setAccessToken(token);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Google login failed.";
      setAuthError(message);
    } finally {
      setAuthLoading(false);
    }
  }

  function handleLogout() {
    if (accessToken) {
      revokeGoogleAccessToken(accessToken);
    }
    logout();
  }

  if (accessToken) {
    return (
      <button
        type="button"
        onClick={handleLogout}
        className="w-full rounded-md border border-border bg-panel px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-panel-alt"
      >
        Disconnect
      </button>
    );
  }

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={handleLogin}
        disabled={isAuthLoading}
        className="w-full rounded-md border border-border bg-panel px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-panel-alt disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isAuthLoading ? "Connecting…" : "Connect Gmail"}
      </button>
      {authError ? <p className="text-xs text-red-500">{authError}</p> : null}
    </div>
  );
}
