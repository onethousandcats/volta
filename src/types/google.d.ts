interface GoogleOAuthTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
}

interface GoogleOAuthTokenClient {
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
}

interface GoogleTokenClientConfig {
  callback: (response: GoogleOAuthTokenResponse) => void;
  client_id: string;
  error_callback?: (error: { type: string }) => void;
  prompt?: string;
  scope: string;
}

interface Window {
  google?: {
    accounts: {
      oauth2: {
        initTokenClient: (config: GoogleTokenClientConfig) => GoogleOAuthTokenClient;
        revoke: (token: string, callback?: () => void) => void;
      };
    };
  };
}
