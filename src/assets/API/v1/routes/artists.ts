import express from "express";

var router = express.Router();

import { getMine } from '../services/user';
import { getById, } from '../services/artists';
import { PermissionLevel, checkJWT, requirePermissionLevel } from '../middlewares/security';

router.get('/', async (req: express.Request, res: express.Response) => {
    res.status(404).json({
        name   : req.t('name'), 
        status : 404, 
        message: req.t('route.unknown')
    });
});

router.get('/:id', checkJWT, requirePermissionLevel(PermissionLevel.USER), getById);

export default router;