const WEBSITE_ASSETS_BASE_URL =
  'https://khizcgryvscakouefofc.supabase.co/storage/v1/object/public/Website%20Assets'

export function getSupabaseAssetUrl(folder: string, filename: string) {
  return `${WEBSITE_ASSETS_BASE_URL}/${encodeURIComponent(folder)}/${encodeURIComponent(filename)}`
}
