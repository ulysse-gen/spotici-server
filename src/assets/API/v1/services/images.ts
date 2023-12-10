import express from 'express';
import { SPOTICI_ALBUMMANAGER, SPOTICI_ARTISTMANAGER, SPOTICI_TRACKMANAGER, spotifyApi } from '../../../..';
import Artist from '../../../classes/Artist';
import db from '../../../db';
import fs from 'fs';
import { Readable } from 'stream';

export async function getPfpById (req: express.Request, res: express.Response) {
  const { id, size = 128 } = req.params;

  if (!id)return res.status(400).json({
      name   : req.t('name'), 
      status : 400, 
      message: req.t('route.images.id_required')
  });

  let Image = fs.readFileSync(`images/profile_picture/${id}.jpg`);
  res.writeHead(200, { 'Content-Length': Image.byteLength, 'Content-Type': 'image/jpeg' });
  var readableStream = Readable.from(Image);
  readableStream.pipe(res);
}