//Album Class
import _ from 'lodash';
import Artist from './Artist';
import { SPOTICI_ARTISTMANAGER, SPOTICI_TRACKMANAGER } from '../..';
import Track from './Track';

export default class Album {
    public id!: string;
    public name!: string;
    public artists!: Artist[];
    public release_date!: string;
    public release_date_precision!: string;
    public tracks!: Track[];
    constructor() {
    }

    FromSpotify(AlbumObject: SpotifyApi.AlbumObjectSimplified) {
        this.id = AlbumObject.id;
        this.name = AlbumObject.name;
        this.artists = AlbumObject.artists.map(artist => SPOTICI_ARTISTMANAGER.getArtist(new Artist().FromSpotify(artist)) as Artist);
        this.release_date = AlbumObject.release_date;
        this.release_date_precision = AlbumObject.release_date_precision;
        return this;
    }

    FromDB(AlbumObject: SpotIci.AlbumObjectSimplified) {
        this.id = AlbumObject.id;
        this.name = AlbumObject.name;
        if (AlbumObject.artists)this.artists = AlbumObject.artists.map(artist => SPOTICI_ARTISTMANAGER.getArtist(new Artist().FromDB(artist)) as Artist);
        if (AlbumObject.tracks)this.tracks = AlbumObject.tracks.map(track => SPOTICI_TRACKMANAGER.getTrack(new Track().FromDB(track)) as Track);
        this.release_date = AlbumObject.release_date;
        this.release_date_precision = AlbumObject.release_date_precision;
        return this;
    }
}