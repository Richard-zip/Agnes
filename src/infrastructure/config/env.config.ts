export interface AppConfig {
  appName: string;
}

export const appConfig: AppConfig = {
  appName: import.meta.env.VITE_APP_NAME || import.meta.env.APP_NAME || "Agnes",
};
