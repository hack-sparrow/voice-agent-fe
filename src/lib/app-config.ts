export interface AppConfig {
  companyName: string;
  pageTitle: string;
  pageDescription: string;

  supportsChatInput: boolean;
  supportsVideoInput: boolean;
  supportsScreenShare: boolean;
  isPreConnectBufferEnabled: boolean;

  logo: string;
  accent: string;
  logoDark?: string;
  accentDark?: string;
  startButtonText: string;

  // Agent dispatch configuration
  agentName?: string;

  // LiveKit Cloud Sandbox configuration
  sandboxId?: string;
  
  // Custom token endpoint (alternative to sandbox)
  tokenEndpoint?: string;
}

export const APP_CONFIG_DEFAULTS: AppConfig = {
  companyName: 'Voice Agent',
  pageTitle: 'Voice Agent',
  pageDescription: 'A voice agent built with LiveKit',

  supportsChatInput: true,
  supportsVideoInput: true,
  supportsScreenShare: true,
  isPreConnectBufferEnabled: true,

  logo: '/lk-logo.svg',
  accent: '#002cf2',
  logoDark: '/lk-logo-dark.svg',
  accentDark: '#1fd5f9',
  startButtonText: 'Start call',

  // Agent dispatch configuration
  agentName: undefined,

  // LiveKit Cloud Sandbox configuration
  sandboxId: undefined,
  
  // Custom token endpoint
  tokenEndpoint: undefined,
};

// Merge defaults with environment variables
export function getAppConfig(): AppConfig {
  const envAgentName = import.meta.env.VITE_AGENT_NAME;
  const envSandboxId = import.meta.env.VITE_SANDBOX_ID;
  const envTokenEndpoint = import.meta.env.VITE_TOKEN_ENDPOINT;

  return {
    ...APP_CONFIG_DEFAULTS,
    agentName: envAgentName || APP_CONFIG_DEFAULTS.agentName,
    sandboxId: envSandboxId || APP_CONFIG_DEFAULTS.sandboxId,
    tokenEndpoint: envTokenEndpoint || APP_CONFIG_DEFAULTS.tokenEndpoint,
  };
}

export const appConfig = getAppConfig();
