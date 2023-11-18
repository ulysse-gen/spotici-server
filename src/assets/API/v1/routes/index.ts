import express from "express";

var router = express.Router();

//Import other routes
import userController from './user';
import trackController from './track';
import libraryController from './library';

router.get('/', async (req: express.Request, res: express.Response) => {
    res.status(404).json({
        name   : req.t('name'), 
        status : 404, 
        message: req.t('route.unknown')
    });
});

router.use('/users', userController);
router.use('/tracks', trackController);
router.use('/library', libraryController);

export default router;