import express from 'express';
import { SPOTICI_TRACKMANAGER, spotifyApi } from '../../../..';

export async function playSong(req: express.Request, res: express.Response) {
  const { trackId } = req.params;

  if (!trackId)return res.status(400).json({
    name   : req.t('name'), 
    status : 400, 
    message: req.t('route.tracks.play.missing_trackId')
  });

  const Track = await SPOTICI_TRACKMANAGER.getTrackById(trackId);

  Track.Stream(req, res);
}