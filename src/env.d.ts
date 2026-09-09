interface ImportMetaEnv {
  readonly MONGODB_URI: string;
  readonly MONGODB_DB?: string;
  readonly PUBLIC_SITE_URL?: string;
  readonly TURNSTILE_SECRET_KEY?: string;
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
