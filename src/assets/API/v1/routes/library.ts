import express from "express";

var router = express.Router();

import { getMine } from '../services/user';
import { query, queryFrom, querySpotify } from '../services/library';
import { PermissionLevel, checkJWT, requirePermissionLevel } from '../middlewares/security';

router.get('/', async (req: express.Request, res: express.Response) => {
    res.status(404).json({
        name   : req.t('name'), 
        status : 404, 
        message: req.t('route.unknown')
    });
});

router.get('/query/:query', checkJWT, requirePermissionLevel(PermissionLevel.USER), query);
router.get('/query/:query/force', checkJWT, requirePermissionLevel(PermissionLevel.USER), querySpotify);
router.get('/query/:query/:from', checkJWT, requirePermissionLevel(PermissionLevel.USER), queryFrom);

export default router;