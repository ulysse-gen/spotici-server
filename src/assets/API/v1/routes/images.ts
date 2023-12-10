import express from "express";

var router = express.Router();

import { PermissionLevel, checkJWT, requirePermissionLevel } from '../middlewares/security';
import { getPfpById } from "../services/images";

router.get('/', async (req: express.Request, res: express.Response) => {
    res.status(404).json({
        name   : req.t('name'), 
        status : 404, 
        message: req.t('route.unknown')
    });
});

router.get('/profile_picture/:id', getPfpById);
router.get('/profile_picture/:id/:size', getPfpById);

export default router;