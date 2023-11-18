import express from "express";

var router = express.Router();

import { getMine } from '../services/user';
import { playSong } from '../services/track';
import { PermissionLevel, checkJWT, requirePermissionLevel } from '../middlewares/security';

router.get('/', async (req: express.Request, res: express.Response) => {
    res.status(404).json({
        name   : req.t('name'), 
        status : 404, 
        message: req.t('route.unknown')
    });
});

router.get('/play/:trackId', checkJWT, requirePermissionLevel(PermissionLevel.USER), playSong);

export default router;