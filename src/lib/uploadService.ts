import { supabase } from './supabase';

export const BUCKET = 'uploads';

export interface UploadMeta {
  id?: string;
  user_id: string | null;
  file_name: string;
  file_path: string;
  file_size: number;
  record_count: number;
  quality_score: number;
  taux: number;
  team_count: number;
  warnings: string[];
  unmapped_cols: string[];
  uploaded_at?: string;
}

export interface SavedFile {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  record_count: number;
  quality_score: number;
  taux: number;
  team_count: number;
  uploaded_at: string;
}

// ─── Storage ──────────────────────────────────────────────────────────────────

/**
 * Upload a File to Supabase Storage.
 * Returns the storage path, or null if Supabase isn't configured / upload fails.
 */
export async function uploadToStorage(
  file: File,
  userId: string | null,
  onProgress?: (pct: number) => void,
): Promise<string | null> {
  try {
    const ts   = Date.now();
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = userId ? `${userId}/${ts}_${safe}` : `anon/${ts}_${safe}`;

    onProgress?.(10);

    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) {
      console.warn('[uploadService] Storage upload failed:', error.message);
      return null;
    }

    onProgress?.(100);
    return path;
  } catch (err) {
    console.warn('[uploadService] uploadToStorage error:', err);
    return null;
  }
}

/**
 * Download a file from Supabase Storage as ArrayBuffer.
 */
export async function downloadFromStorage(path: string): Promise<ArrayBuffer | null> {
  try {
    const { data, error } = await supabase.storage.from(BUCKET).download(path);
    if (error || !data) return null;
    return await data.arrayBuffer();
  } catch {
    return null;
  }
}

/**
 * Delete a file from Supabase Storage.
 */
export async function deleteFromStorage(path: string): Promise<void> {
  try {
    await supabase.storage.from(BUCKET).remove([path]);
  } catch {
    // non-critical
  }
}

// ─── Database ─────────────────────────────────────────────────────────────────

/**
 * Save file metadata to the file_uploads table.
 */
export async function saveFileMeta(meta: UploadMeta): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('file_uploads')
      .insert({
        user_id:       meta.user_id,
        file_name:     meta.file_name,
        file_path:     meta.file_path,
        file_size:     meta.file_size,
        record_count:  meta.record_count,
        quality_score: meta.quality_score,
        taux:          meta.taux,
        team_count:    meta.team_count,
        warnings:      meta.warnings,
        unmapped_cols: meta.unmapped_cols,
      })
      .select('id')
      .single();

    if (error) {
      console.warn('[uploadService] saveFileMeta failed:', error.message);
      return null;
    }

    return (data as { id: string }).id;
  } catch (err) {
    console.warn('[uploadService] saveFileMeta error:', err);
    return null;
  }
}

/**
 * List files saved by the current user.
 */
export async function listSavedFiles(userId: string | null): Promise<SavedFile[]> {
  try {
    let query = supabase
      .from('file_uploads')
      .select('id, file_name, file_path, file_size, record_count, quality_score, taux, team_count, uploaded_at')
      .order('uploaded_at', { ascending: false })
      .limit(50);

    if (userId) query = query.eq('user_id', userId);

    const { data, error } = await query;
    if (error) return [];
    return (data as SavedFile[]) || [];
  } catch {
    return [];
  }
}

/**
 * Delete a file record from the database (and optionally from storage).
 */
export async function deleteFileMeta(id: string, storagePath: string): Promise<void> {
  try {
    await supabase.from('file_uploads').delete().eq('id', id);
    await deleteFromStorage(storagePath);
  } catch {
    // non-critical
  }
}
