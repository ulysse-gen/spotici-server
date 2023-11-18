import express from "express";

var router = express.Router();

import { auth, getMine, getUserByUsername, register } from '../services/user';
import { PermissionLevel, checkJWT, requirePermissionLevel } from '../middlewares/security';

router.get('/', async (req: express.Request, res: express.Response) => {
    res.status(404).json({
        name   : req.t('name'), 
        status : 404, 
        message: req.t('route.unknown')
    });
});

router.post('/auth', auth);

router.post('/register', register);

router.get('/@me', checkJWT, getMine, getUserByUsername);
router.get('/@:username', checkJWT, requirePermissionLevel(PermissionLevel.MOD), getUserByUsername);

export default router;