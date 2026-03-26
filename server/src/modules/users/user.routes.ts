import { Router } from 'express';
import { authenticate } from '../../shared/middleware/authenticate.middleware';
import { validateBody } from '../../shared/middleware/validate.middleware';
import { asyncHandler } from '../../shared/utils/async-handler';
import { successResponse } from '../../shared/utils/api-response';
import { userService } from './user.service';
import {
  updateUserProfileSchema,
  switchRoleSchema,
  updateDocumentVisibilitySettingsSchema,
} from './user.schemas';

const router = Router();

router.get(
  '/users/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await userService.getById(req.user!.id);
    return successResponse(res, user);
  }),
);

router.patch(
  '/users/me',
  authenticate,
  validateBody(updateUserProfileSchema),
  asyncHandler(async (req, res) => {
    const user = await userService.updateProfile(req.user!.id, req.body);
    return successResponse(res, user, 'Profile updated');
  }),
);

// Switch user role between normal and taxi
router.patch(
  '/users/me/role',
  authenticate,
  validateBody(switchRoleSchema),
  asyncHandler(async (req, res) => {
    const { role } = req.body as { role: 'normal' | 'taxi' };
    const user = await userService.switchRole(req.user!.id, role);
    return successResponse(res, user, `Role switched to ${role}`);
  }),
);

// Get document visibility settings
router.get(
  '/users/me/document-settings',
  authenticate,
  asyncHandler(async (req, res) => {
    const settings = await userService.getDocumentVisibilitySettings(req.user!.id);
    return successResponse(res, settings);
  }),
);

// Update document visibility settings
router.put(
  '/users/me/document-settings',
  authenticate,
  validateBody(updateDocumentVisibilitySettingsSchema),
  asyncHandler(async (req, res) => {
    const settings = await userService.updateDocumentVisibilitySettings(
      req.user!.id,
      req.body,
    );
    return successResponse(res, settings, 'Document visibility settings updated');
  }),
);

export const userRouter = router;
