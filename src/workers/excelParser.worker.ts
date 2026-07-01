import { parseExcelBuffer } from '../hooks/useExcelData';

export type WorkerRequest = {
  buffer: ArrayBuffer;
  fileName: string;
};

export type WorkerResponse =
  | { type: 'progress'; step: string }
  | { type: 'done';    result: ReturnType<typeof parseExcelBuffer> }
  | { type: 'error';   message: string };

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  try {
    const { buffer, fileName } = e.data;

    (self as unknown as Worker).postMessage({ type: 'progress', step: 'Lecture du fichier…' } satisfies WorkerResponse);

    // Small yield so the progress message renders before the heavy parse
    setTimeout(() => {
      try {
        (self as unknown as Worker).postMessage({ type: 'progress', step: 'Détection des colonnes…' } satisfies WorkerResponse);
        const result = parseExcelBuffer(buffer, fileName);
        (self as unknown as Worker).postMessage({ type: 'done', result } satisfies WorkerResponse);
      } catch (err) {
        (self as unknown as Worker).postMessage({
          type: 'error',
          message: err instanceof Error ? err.message : 'Erreur de parsing inconnue',
        } satisfies WorkerResponse);
      }
    }, 0);
  } catch (err) {
    (self as unknown as Worker).postMessage({
      type: 'error',
      message: err instanceof Error ? err.message : 'Erreur inconnue',
    } satisfies WorkerResponse);
  }
};
