import { supabase } from '../integrations/supabase/client'

const WEBSITE_ASSETS_BUCKET = 'Website Assets'
const WEBSITE_ASSETS_BASE_URL =
  'https://khizcgryvscakouefofc.supabase.co/storage/v1/object/public/Website%20Assets'
const CAROUSEL_FOLDER = 'Karussell'
const CAROUSEL_FILE_PATTERN = /^karussell_(\d+)\.webp$/i
const STORAGE_PAGE_SIZE = 100

export type CarouselAsset = {
  name: string
  url: string
}

export function getSupabaseAssetUrl(folder: string, filename: string) {
  return `${WEBSITE_ASSETS_BASE_URL}/${encodeURIComponent(folder)}/${encodeURIComponent(filename)}`
}

export async function getCarouselAssets(): Promise<CarouselAsset[]> {
  const files: Array<{ name: string; order: number }> = []
  let offset = 0

  while (true) {
    const { data, error } = await supabase.storage
      .from(WEBSITE_ASSETS_BUCKET)
      .list(CAROUSEL_FOLDER, {
        limit: STORAGE_PAGE_SIZE,
        offset,
        sortBy: { column: 'name', order: 'asc' },
      })

    if (error) throw error

    for (const entry of data) {
      const match = CAROUSEL_FILE_PATTERN.exec(entry.name)
      if (match) files.push({ name: entry.name, order: Number(match[1]) })
    }

    if (data.length < STORAGE_PAGE_SIZE) break
    offset += STORAGE_PAGE_SIZE
  }

  return files
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
    .map(({ name }) => ({
      name,
      url: supabase.storage
        .from(WEBSITE_ASSETS_BUCKET)
        .getPublicUrl(`${CAROUSEL_FOLDER}/${name}`).data.publicUrl,
    }))
}
