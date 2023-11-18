import express from 'express';
import fs from "fs/promises";
import path from "path";
import NodeID3 from 'node-id3';
import { SPOTICI_ALBUMMANAGER, SPOTICI_ARTISTMANAGER, SPOTICI_TRACKMANAGER, spotifyApi } from '../../../..';
import Track from '../../../classes/Track';
import Album from '../../../classes/Album';
import Artist from '../../../classes/Artist';

export async function query (req: express.Request, res: express.Response) {
  const { query } = req.params;

  if (!query)return res.status(400).json({
      name   : req.t('name'), 
      status : 400, 
      message: req.t('route.tracks.query.query_required')
  });

  let results = {
    tracks: await SPOTICI_TRACKMANAGER.searchQueryDB(query) as Array<SpotIci.DBTrack>,
    artists: await SPOTICI_ARTISTMANAGER.searchQueryDB(query) as Array<SpotIci.DBArtist>,
    albums: await SPOTICI_ALBUMMANAGER.searchQueryDB(query) as Array<SpotIci.DBAlbum>,
    playlists: []
  }

  const Tracks = results.tracks.map(async TrackObject => SPOTICI_TRACKMANAGER.getTrack(await new Track().FromDB(TrackObject)));
  const Albums = results.albums.map(async AlbumObject => SPOTICI_ALBUMMANAGER.getAlbum(await new Album().FromDB(AlbumObject)));
  const Artists = results.artists.map(async ArtistObject => SPOTICI_ARTISTMANAGER.getArtist(await new Artist().FromDB(ArtistObject)));

  let SearchData = {
    tracks: await Promise.all(Tracks),
    artists: await Promise.all(Albums),
    albums: await Promise.all(Artists),
    playlists: []
  }

  return res.status(200).json({
    name   : req.t('name'), 
    status : 200, 
    message: req.t('route.tracks.query.success'),
    data: SearchData
  });
}

export async function queryForce (req: express.Request, res: express.Response) {
  const { query } = req.params;

  if (!query)return res.status(400).json({
      name   : req.t('name'), 
      status : 400, 
      message: req.t('route.tracks.query.query_required')
  });

  const results = await spotifyApi.search(query, ["album", "artist", "playlist", "track"]).catch(async err => {
    return spotifyApi.refreshAccessToken().then(data => {
      spotifyApi.setAccessToken(data.body['access_token']);
    });
  }).catch(err => {
    return null;
  }).then(async () => {
    return spotifyApi.search(query, ["album", "artist", "playlist", "track"])
  }).catch(err => {
    return null;
  });
  if (!results)return res.status(500).json({
    name   : req.t('name'), 
    status : 500, 
    message: req.t('route.tracks.query.failure')
  }); 
  let Tracks = results.body.tracks?.items.map(TrackObject => {
    const TrackItem = new Track().FromSpotify(TrackObject);
    SPOTICI_TRACKMANAGER.getTrack(TrackItem);
    return TrackItem;
  });
  let Albums = results.body.albums?.items.map(AlbumObject => {
    const AlbumItem = new Album().FromSpotify(AlbumObject);
    SPOTICI_ALBUMMANAGER.getAlbum(AlbumItem);
    return AlbumItem;
  });
  let Artists = results.body.artists?.items.map(ArtistObject => {
    const ArtistItem = new Artist().FromSpotify(ArtistObject);
    SPOTICI_ARTISTMANAGER.getArtist(ArtistItem);
    return ArtistItem;
  });

  Tracks?.forEach(track => {
    if (!Albums?.map(album => album.id).includes(track.album.id))Albums?.push(track.album);
  });
  Tracks?.forEach(track => {
    track.artists.forEach(artist => {
      if (!Artists?.map(artist2 => artist2.id).includes(artist.id))Artists?.push(artist);
    })
  });
  Albums?.forEach(album => {
    album.artists.forEach(artist => {
      if (!Artists?.map(artist2 => artist2.id).includes(artist.id))Artists?.push(artist);
    })
  });

  if (Tracks && Tracks.length != 0)SPOTICI_TRACKMANAGER.createTracksOnDB(Tracks);
  if (Albums && Albums.length != 0)SPOTICI_ALBUMMANAGER.createAlbumsOnDB(Albums);
  if (Artists && Artists.length != 0)SPOTICI_ARTISTMANAGER.createArtistsOnDB(Artists);

  let SearchData = {
    tracks: Tracks,
    artists: Artists,
    albums: Albums,
    playlists: []
  }

  return res.status(200).json({
    name   : req.t('name'), 
    status : 200, 
    message: req.t('route.tracks.query.success'),
    data: SearchData
  });
}

export async function walk(directory: string) {
  let fileList: string[] = [];

  const files = await fs.readdir(directory);
  for (const file of files) {
    const p = path.join(directory, file);
    if ((await fs.stat(p)).isDirectory()) {
      fileList = [...fileList, ...(await walk(p))];
    } else {
      fileList.push(p);
    }
  }

  return fileList;
}