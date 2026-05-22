/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Personal access token or legacy API key (read-only base access). Ships in bundle. */
  readonly VITE_AIRTABLE_TOKEN: string;
  /** Alias for `VITE_AIRTABLE_TOKEN`. */
  readonly VITE_AIRTABLE_API_KEY: string;
  readonly VITE_AIRTABLE_BASE_ID: string;
  readonly VITE_AIRTABLE_TABLE_NAME: string;
  /** Optional override (default `https://api.airtable.com/v0`). Use if you terminate through a proxy. */
  readonly VITE_AIRTABLE_API_BASE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
