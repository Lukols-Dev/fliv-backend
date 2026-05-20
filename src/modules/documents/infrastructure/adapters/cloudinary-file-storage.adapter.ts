import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  v2 as cloudinary,
  type UploadApiResponse,
  type UploadApiErrorResponse,
} from 'cloudinary';
import {
  type FileStoragePort,
  type UploadFileParams,
  type UploadedFileInfo,
} from '../../application/ports/file-storage.port';

@Injectable()
export class CloudinaryFileStorageAdapter implements FileStoragePort {
  private readonly defaultFolder: string;

  constructor(private readonly configService: ConfigService) {
    const cloudName = this.configService.get<string>('cloudinary.cloudName');
    const apiKey = this.configService.get<string>('cloudinary.apiKey');
    const apiSecret = this.configService.get<string>('cloudinary.apiSecret');

    this.defaultFolder =
      this.configService.get<string>('cloudinary.defaultFolder') ?? 'fliv';

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Cloudinary is not configured correctly');
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  }

  async uploadFile(params: UploadFileParams): Promise<UploadedFileInfo> {
    const folder = params.folder ?? this.defaultFolder;

    const uploadResult = await new Promise<UploadApiResponse>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'auto',
          },
          (
            error: UploadApiErrorResponse | undefined,
            result: UploadApiResponse | undefined,
          ) => {
            if (error) {
              const message =
                typeof error.message === 'string' && error.message.length > 0
                  ? error.message
                  : 'Cloudinary upload failed';

              reject(new Error(message));
              return;
            }

            if (!result) {
              reject(
                new Error('Cloudinary upload failed: empty upload result'),
              );
              return;
            }

            resolve(result);
          },
        );

        stream.on('error', (streamError: unknown) => {
          if (streamError instanceof Error) {
            reject(streamError);
          } else {
            reject(new Error('Cloudinary upload stream error'));
          }
        });

        stream.end(params.localFile.buffer);
      },
    );

    return {
      url: uploadResult.secure_url ?? uploadResult.url,
      storageKey: uploadResult.public_id,
      mimeType: params.localFile.mimeType,
      sizeBytes: params.localFile.sizeBytes,
      originalFilename: params.localFile.originalFilename,
    };
  }

  async deleteFile(storageKey: string): Promise<void> {
    await cloudinary.uploader.destroy(storageKey, {
      resource_type: 'auto',
    });
  }
}
