/**
 * Hub Music - Storage Service (Stub)
 * Sem upload de arquivos locais — foco apenas em APIs públicas (Deezer, etc.)
 * Storage service stub — no local file upload, focused on public APIs only
 * 
 * @languages pt-BR / en-US
 */

export async function ensureBucket(): Promise<void> {
  // Sem storage local — nada a fazer
}

export async function uploadAudio(buffer: Buffer, filename: string, userId: string): Promise<string> {
  throw new Error('Upload de áudio local não suportado. Use apenas APIs públicas.');
}

export async function deleteAudio(objectName: string): Promise<void> {
  throw new Error('Exclusão de áudio local não suportado.');
}

export async function generateSignedUrl(objectName: string): Promise<string> {
  // Sem storage assinado — retorna a URL original como está
  return objectName;
}

export async function streamAudio(
  request: any,
  reply: any,
  objectName: string
): Promise<void> {
  reply.status(501).send({ error: 'Streaming de áudio local não suportado.' });
}

export async function getAudioMetadata(objectName: string): Promise<{ size: number; contentType: string }> {
  throw new Error('Metadados de áudio local não suportado.');
}

export default null;
