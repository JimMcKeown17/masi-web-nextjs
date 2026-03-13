const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface EtlTableStatus {
  name: string;
  record_count: number;
  last_sync: string | null;
  last_sync_records: number | null;
}

export interface EtlStatusResponse {
  tables: EtlTableStatus[];
}

export interface OrphanStats {
  [key: string]: number;
}

export interface EtlPreviewResponse {
  table_name: string;
  record_count: number;
  orphan_stats?: OrphanStats;
  sample_rows: Record<string, unknown>[];
}

export async function getEtlStatus(token: string): Promise<EtlStatusResponse> {
  const response = await fetch(`${API_URL}/etl-status/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch ETL status');
  return response.json();
}

export async function getEtlPreview(
  token: string,
  tableName: string
): Promise<EtlPreviewResponse> {
  const response = await fetch(`${API_URL}/etl-preview/${tableName}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`Failed to fetch preview for ${tableName}`);
  return response.json();
}
