//Track Class
import express from 'express';
import _ from 'lodash';
import { SPOTICI_ALBUMMANAGER, SPOTICI_ARTISTMANAGER } from '../..';
import Album from './Album';
import Artist from './Artist';
import YTMusic from "ytmusic-api";
import YTGet from 'yt-get';
import { Duplex, Readable } from 'stream';

export default class Track {
    public id!: string;
    public name!: string;
    public album!: Album;
    public artists!: Artist[];
    public duration_ms!: number;
    public release!: string;
    public disc_number!: number;
    public track_number!: number;

    public artistsNames!: string[];
    public MP3Buffer?: Buffer;
    constructor() {
    }

    FromSpotify(TrackObject: SpotifyApi.TrackObjectFull) {
        this.id = TrackObject.id;
        this.name = TrackObject.name;
        this.album = SPOTICI_ALBUMMANAGER.getAlbum(new Album().FromSpotify(TrackObject.album)) as Album;
        this.artists = TrackObject.artists.map(artist => SPOTICI_ARTISTMANAGER.getArtist(new Artist().FromSpotify(artist)) as Artist);
        this.artistsNames = TrackObject.artists.map(artist => artist.name);
        this.duration_ms = TrackObject.duration_ms;
        this.release = TrackObject.album.release_date;
        this.disc_number = TrackObject.disc_number;
        this.track_number = TrackObject.track_number;
        return this;
    }

    async FromDB(TrackObject: SpotIci.DBTrack) {
        this.id = TrackObject.id;
        this.name = TrackObject.name;
        this.album = await SPOTICI_ALBUMMANAGER.getAlbumById(TrackObject.album);
        this.artists = await Promise.all(JSON.parse(TrackObject.artists).map(async artist => SPOTICI_ARTISTMANAGER.getArtistById(artist)));
        this.artistsNames = JSON.parse(TrackObject.artistsNames);
        this.duration_ms = TrackObject.duration_ms;
        this.release = TrackObject.release;
        this.disc_number = TrackObject.disc_number;
        this.track_number = TrackObject.track_number;
        return this;
    }

    async Stream(req: express.Request, res: express.Response) {
        const ytmusic = await new YTMusic().initialize() as YTMusic;

        if (!this.MP3Buffer) {
            const YTSong = await ytmusic.searchSongs(`${this.name} - ${this.artists.map(artist => artist.name).join(' ')}`).then(songs => songs[0]);
            const { mp3 } = await YTGet.getVideoMP3Binary(`https://www.youtube.com/watch?v=${YTSong.videoId}`);
            this.MP3Buffer = mp3;
        }

        var total = this.MP3Buffer.byteLength;
        if (req.headers.range) {
            var range = req.headers.range;
            var parts = range.replace(/bytes=/, "").split("-");
            var partialstart = parts[0];
            var partialend = parts[1];
    
            var start = parseInt(partialstart, 10);
            var end = partialend ? parseInt(partialend, 10) : total-1;
            var chunksize = (end-start)+1;
            var readableStream = Readable.from(this.MP3Buffer.slice(start, end));
            console.log(this.MP3Buffer.byteLength, this.MP3Buffer.slice(start, end).byteLength)
            res.writeHead(206, {
                'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
                'Accept-Ranges': 'bytes', 'Content-Length': chunksize,
                'Content-Type': 'audio/mpeg'
            });
            readableStream.pipe(res);
            readableStream.on('finish', function(){console.log('finish ig')});
         } else {
            res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'audio/mpeg' });
            var readableStream = Readable.from(this.MP3Buffer);
            readableStream.pipe(res);
         }
    }
}