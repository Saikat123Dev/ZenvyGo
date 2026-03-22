import { Router } from 'express';
import { authenticate } from '../../shared/middleware/authenticate.middleware';
import { validateBody } from '../../shared/middleware/validate.middleware';
import { asyncHandler } from '../../shared/utils/async-handler';
import { successResponse } from '../../shared/utils/api-response';
import { userService } from './user.service';
import { updateUserProfileSchema } from './user.schemas';

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

export const userRouter = router;
