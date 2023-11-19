//Album Class
import _ from 'lodash';
import Artist from './Artist';
import { SPOTICI_ARTISTMANAGER } from '../..';

export default class Album {
    public id!: string;
    public name!: string;
    public artists!: Artist[];
    public release!: string;
    public total_tracks!: number;
    public image!: string | undefined;
    constructor() {
    }

    FromSpotify(AlbumObject: SpotifyApi.AlbumObjectSimplified) {
        this.id = AlbumObject.id;
        this.name = AlbumObject.name;
        this.artists = AlbumObject.artists.map(artist => SPOTICI_ARTISTMANAGER.getArtist(new Artist().FromSpotify(artist)) as Artist);
        this.release = AlbumObject.release_date;
        this.total_tracks = AlbumObject.total_tracks;
        this.image = AlbumObject.images.shift()?.url;
        return this;
    }

    async FromDB(AlbumObject: SpotIci.DBAlbum) {
        this.id = AlbumObject.id;
        this.name = AlbumObject.name;
        this.artists = await Promise.all(JSON.parse(AlbumObject.artists).map(async artist => SPOTICI_ARTISTMANAGER.getArtistById(artist)));
        this.release = AlbumObject.release;
        this.total_tracks = AlbumObject.total_tracks;
        this.image = AlbumObject.image;
        return this;
    }
}