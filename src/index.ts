//SpotIci server (API & Socket)
import * as dotenv from 'dotenv';
import SpotifyWebApi from 'spotify-web-api-node';
dotenv.config();

export const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_ID,
    clientSecret: process.env.SPOTIFY_SECRET
});

spotifyApi.clientCredentialsGrant().then(
    function(data) {
        spotifyApi.setAccessToken(data.body['access_token']);
        spotifyApi.setRefreshToken(data.body['refresh_token']);
    },
    function(err) {
        console.log('Something went wrong!', err);
    }
);

import API from "./assets/classes/API";
import TrackManager from './assets/classes/TrackManager';
import AlbumManager from './assets/classes/AlbumManager';
import ArtistManager from './assets/classes/ArtistManager';

export const SPOTICI_API = new API().Start();
export const SPOTICI_TRACKMANAGER = new TrackManager();
export const SPOTICI_ALBUMMANAGER = new AlbumManager();
export const SPOTICI_ARTISTMANAGER = new ArtistManager();