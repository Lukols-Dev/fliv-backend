export const FILE_STORAGE_PORT = Symbol('FILE_STORAGE_PORT');

export interface LocalFile {
  buffer: Buffer;
  mimeType: string;
  sizeBytes?: number;
  originalFilename?: string;
}

export interface UploadedFileInfo {
  url: string;
  storageKey: string;
  mimeType: string;
  sizeBytes?: number;
  originalFilename?: string;
}

export interface UploadFileParams {
  localFile: LocalFile;
  folder?: string;
}

export interface FileStoragePort {
  uploadFile(params: UploadFileParams): Promise<UploadedFileInfo>;
  deleteFile(storageKey: string): Promise<void>;
}
