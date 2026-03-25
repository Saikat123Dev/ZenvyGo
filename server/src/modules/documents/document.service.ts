import { ftpService } from '../../shared/services/ftp.service';
import { cacheService } from '../../shared/cache/cache.service';
import {
    BadRequestError,
    NotFoundError,
    ServiceUnavailableError,
} from '../../shared/utils/api-error';
import { generateUUID } from '../../shared/utils/crypto';
import { log } from '../../shared/utils/logger';
import { DocumentRepository, type DocumentRecord } from './document.repository';
import type { DocumentType } from './document.schemas';

export interface DocumentSummary {
  id: string;
  userId: string;
  vehicleId: string | null;
  documentType: DocumentType;
  documentName: string;
  documentNumber: string | null;
  fileUrl: string;
  fileType: string;
  originalFilename: string;
  fileSizeBytes: number;
  issuedAt: string | null;
  expiresAt: string | null;
  status: 'pending' | 'verified' | 'rejected' | 'expired';
  isVisibleToPassenger: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentInput {
  vehicleId?: string | null;
  documentType: DocumentType;
  documentName: string;
  documentNumber?: string | null;
  issuedAt?: string | null;
  expiresAt?: string | null;
  isVisibleToPassenger?: boolean;
}

export interface UpdateDocumentInput {
  documentName?: string;
  documentNumber?: string | null;
  issuedAt?: string | null;
  expiresAt?: string | null;
  isVisibleToPassenger?: boolean;
}

export interface PublicDocumentView {
  type: DocumentType;
  name: string;
  fileUrl: string;
  expiresAt: string | null;
}

class DocumentService {
  private readonly repository = new DocumentRepository();

  async listByUser(userId: string): Promise<DocumentSummary[]> {
    const cacheKey = `docs:list:${userId}`;
    const cached = await cacheService.get<DocumentSummary[]>('CACHE', cacheKey);
    if (cached) {
      return cached;
    }

    const records = await this.repository.findByUserId(userId);
    const result = records.map((r) => this.toSummary(r));

    // Cache for 2 minutes
    await cacheService.set('CACHE', cacheKey, result, 120);
    return result;
  }

  async getById(userId: string, documentId: string): Promise<DocumentSummary> {
    const record = await this.repository.findByIdAndUserId(documentId, userId);
    if (!record) {
      throw new NotFoundError('Document not found');
    }
    return this.toSummary(record);
  }

  async create(
    userId: string,
    input: CreateDocumentInput,
    file: { buffer: Buffer; mimetype: string; originalname: string }
  ): Promise<DocumentSummary> {
    // Validate document type and vehicle association
    if (input.documentType === 'driving_license') {
      if (input.vehicleId) {
        throw new BadRequestError('Driving license should not have vehicleId');
      }
    } else if (
      input.documentType === 'rc' ||
      input.documentType === 'puc' ||
      input.documentType === 'insurance'
    ) {
      if (!input.vehicleId) {
        throw new BadRequestError('Vehicle documents (RC, PUC, Insurance) require vehicleId');
      }
    }

    // Validate file type
    if (!ftpService.isAllowedMimeType(file.mimetype)) {
      throw new BadRequestError('Invalid file type. Allowed types: JPEG, PNG, WebP, PDF');
    }

    // Validate file size
    if (file.buffer.length > ftpService.getMaxFileSize()) {
      throw new BadRequestError('File size exceeds maximum limit of 5MB');
    }

    // Upload file to FTP
    let uploadResult;
    try {
      uploadResult = await ftpService.uploadBuffer(file.buffer, file.originalname, file.mimetype);
    } catch (error: any) {
      log.error('Document upload failed during FTP transfer', error, {
        userId,
        documentType: input.documentType,
      });

      throw new ServiceUnavailableError(
        'Document upload is temporarily unavailable. Please try again shortly.'
      );
    }

    const documentId = generateUUID();

    await this.repository.create({
      id: documentId,
      userId,
      vehicleId: input.vehicleId,
      documentType: input.documentType,
      documentName: input.documentName,
      documentNumber: input.documentNumber,
      fileUrl: uploadResult.fileUrl,
      fileType: file.mimetype,
      originalFilename: file.originalname,
      fileSizeBytes: file.buffer.length,
      issuedAt: input.issuedAt,
      expiresAt: input.expiresAt,
      isVisibleToPassenger: input.isVisibleToPassenger ?? false,
    });

    const created = await this.repository.findById(documentId);
    if (!created) {
      throw new Error('Failed to create document');
    }

    // Invalidate list cache
    await this.invalidateUserCache(userId);

    return this.toSummary(created);
  }

  /**
   * Invalidate all document cache entries for a user
   */
  private async invalidateUserCache(userId: string): Promise<void> {
    await cacheService.delete('CACHE', `docs:list:${userId}`);
  }

  async update(
    userId: string,
    documentId: string,
    input: UpdateDocumentInput
  ): Promise<DocumentSummary> {
    const existing = await this.repository.findByIdAndUserId(documentId, userId);
    if (!existing) {
      throw new NotFoundError('Document not found');
    }

    await this.repository.update(documentId, input);

    const updated = await this.repository.findById(documentId);
    if (!updated) {
      throw new Error('Failed to update document');
    }

    // Invalidate list cache
    await this.invalidateUserCache(userId);

    return this.toSummary(updated);
  }

  async delete(userId: string, documentId: string): Promise<void> {
    const existing = await this.repository.findByIdAndUserId(documentId, userId);
    if (!existing) {
      throw new NotFoundError('Document not found');
    }

    // Soft delete from database
    await this.repository.softDelete(documentId);

    // Invalidate list cache
    await this.invalidateUserCache(userId);

    // Optionally delete from FTP (commented out for now - keep for audit trail)
    // await ftpService.deleteFile(existing.file_url);
  }

  async toggleVisibility(
    userId: string,
    documentId: string,
    isVisible: boolean
  ): Promise<DocumentSummary> {
    const existing = await this.repository.findByIdAndUserId(documentId, userId);
    if (!existing) {
      throw new NotFoundError('Document not found');
    }

    await this.repository.updateVisibility(documentId, isVisible);

    const updated = await this.repository.findById(documentId);
    if (!updated) {
      throw new Error('Failed to update document');
    }

    // Invalidate list cache
    await this.invalidateUserCache(userId);

    return this.toSummary(updated);
  }

  async getVisibleDocumentsForUser(userId: string): Promise<PublicDocumentView[]> {
    const records = await this.repository.findVisibleByUserId(userId);
    return records.map((r) => ({
      type: r.document_type,
      name: r.document_name,
      fileUrl: r.file_url,
      expiresAt: r.expires_at,
    }));
  }

  async getVisibleDocumentsForVehicle(vehicleId: string): Promise<PublicDocumentView[]> {
    const records = await this.repository.findVisibleByVehicleId(vehicleId);
    return records.map((r) => ({
      type: r.document_type,
      name: r.document_name,
      fileUrl: r.file_url,
      expiresAt: r.expires_at,
    }));
  }

  private toSummary(record: DocumentRecord): DocumentSummary {
    return {
      id: record.id,
      userId: record.user_id,
      vehicleId: record.vehicle_id,
      documentType: record.document_type,
      documentName: record.document_name,
      documentNumber: record.document_number,
      fileUrl: record.file_url,
      fileType: record.file_type,
      originalFilename: record.original_filename,
      fileSizeBytes: record.file_size_bytes,
      issuedAt: record.issued_at,
      expiresAt: record.expires_at,
      status: record.status,
      isVisibleToPassenger: record.is_visible_to_passenger === 1,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    };
  }
}

export const documentService = new DocumentService();
