import express from 'express';
import { SPOTICI_ALBUMMANAGER, SPOTICI_ARTISTMANAGER, SPOTICI_TRACKMANAGER, spotifyApi } from '../../../..';
import Artist from '../../../classes/Artist';

export async function getById (req: express.Request, res: express.Response) {
  const { id } = req.params;

  if (!id)return res.status(400).json({
      name   : req.t('name'), 
      status : 400, 
      message: req.t('route.artists.id_required')
  });

  const Artist = await SPOTICI_ARTISTMANAGER.getArtistById(id);

  return res.status(200).json({
    name   : req.t('name'), 
    status : 200, 
    message: req.t('route.tracks.query.success'),
    data: Artist
  });
}