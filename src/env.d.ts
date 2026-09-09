interface ImportMetaEnv {
  readonly MONGODB_URI: string;
  readonly MONGODB_DB?: string;
  readonly PUBLIC_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
