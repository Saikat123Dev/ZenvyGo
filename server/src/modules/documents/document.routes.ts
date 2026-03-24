import { Router } from 'express';
import { authenticate } from '../../shared/middleware/authenticate.middleware';
import { documentUpload } from '../../shared/middleware/upload.middleware';
import { validateBody, validateParams } from '../../shared/middleware/validate.middleware';
import { asyncHandler } from '../../shared/utils/async-handler';
import { noContentResponse, successResponse } from '../../shared/utils/api-response';
import { BadRequestError } from '../../shared/utils/api-error';
import {
  createDocumentSchema,
  documentIdParamsSchema,
  toggleVisibilitySchema,
  updateDocumentSchema,
} from './document.schemas';
import { documentService } from './document.service';

const router = Router();

// List all documents for authenticated user
router.get(
  '/documents',
  authenticate,
  asyncHandler(async (req, res) => {
    const documents = await documentService.listByUser(req.user!.id);
    return successResponse(res, documents);
  }),
);

// Upload new document
router.post(
  '/documents',
  authenticate,
  documentUpload,
  validateBody(createDocumentSchema),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new BadRequestError('File is required');
    }

    const document = await documentService.create(req.user!.id, req.body, {
      buffer: req.file.buffer,
      mimetype: req.file.mimetype,
      originalname: req.file.originalname,
    });

    return successResponse(res, document, 'Document uploaded successfully', 201);
  }),
);

// Get single document
router.get(
  '/documents/:documentId',
  authenticate,
  validateParams(documentIdParamsSchema),
  asyncHandler(async (req, res) => {
    const { documentId } = req.params as { documentId: string };
    const document = await documentService.getById(req.user!.id, documentId);
    return successResponse(res, document);
  }),
);

// Update document metadata
router.patch(
  '/documents/:documentId',
  authenticate,
  validateParams(documentIdParamsSchema),
  validateBody(updateDocumentSchema),
  asyncHandler(async (req, res) => {
    const { documentId } = req.params as { documentId: string };
    const document = await documentService.update(req.user!.id, documentId, req.body);
    return successResponse(res, document, 'Document updated successfully');
  }),
);

// Delete document
router.delete(
  '/documents/:documentId',
  authenticate,
  validateParams(documentIdParamsSchema),
  asyncHandler(async (req, res) => {
    const { documentId } = req.params as { documentId: string };
    await documentService.delete(req.user!.id, documentId);
    return noContentResponse(res);
  }),
);

// Toggle visibility
router.patch(
  '/documents/:documentId/visibility',
  authenticate,
  validateParams(documentIdParamsSchema),
  validateBody(toggleVisibilitySchema),
  asyncHandler(async (req, res) => {
    const { documentId } = req.params as { documentId: string };
    const { isVisibleToPassenger } = req.body as { isVisibleToPassenger: boolean };
    const document = await documentService.toggleVisibility(
      req.user!.id,
      documentId,
      isVisibleToPassenger,
    );
    return successResponse(res, document, 'Visibility updated successfully');
  }),
);

export const documentRouter = router;
