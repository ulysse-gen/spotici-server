//Album Class
import _ from 'lodash';
import Artist from './Artist';
import { SPOTICI_ARTISTMANAGER } from '../..';

export default class Album {
    public id!: string;
    public name!: string;
    public artists!: Artist[];
    public release!: string;
    constructor() {
    }

    FromSpotify(AlbumObject: SpotifyApi.AlbumObjectSimplified) {
        this.id = AlbumObject.id;
        this.name = AlbumObject.name;
        this.artists = AlbumObject.artists.map(artist => SPOTICI_ARTISTMANAGER.getArtist(new Artist().FromSpotify(artist)) as Artist);
        this.release = AlbumObject.release_date;
        return this;
    }

    async FromDB(AlbumObject: SpotIci.DBAlbum) {
        this.id = AlbumObject.id;
        this.name = AlbumObject.name;
        this.artists = await Promise.all(JSON.parse(AlbumObject.artists).map(async artist => SPOTICI_ARTISTMANAGER.getArtistById(artist)));
        this.release = AlbumObject.release;
        return this;
    }
}