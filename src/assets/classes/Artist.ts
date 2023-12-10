//Artist Class
import _ from 'lodash';
import Album from './Album';
import Track from './Track';
import { SPOTICI_ALBUMMANAGER, SPOTICI_TRACKMANAGER } from '../..';

export default class Artist {
    public id!: string;
    public name!: string;
    public albums!: Album[];
    public tracks!: Track[];
    constructor() {
    }

    FromSpotify(ArtistObjet: SpotifyApi.ArtistObjectSimplified) {
        this.id = ArtistObjet.id;
        this.name = ArtistObjet.name;
        return this;
    }

    FromDB(ArtistObjet: SpotIci.ArtistObjectSimplified) {
        this.id = ArtistObjet.id;
        this.name = ArtistObjet.name;
        if (ArtistObjet.albums)this.albums = ArtistObjet.albums.map(album => SPOTICI_ALBUMMANAGER.getAlbum(new Album().FromDB(album)) as Album);
        if (ArtistObjet.tracks)this.tracks = ArtistObjet.tracks.map(track => SPOTICI_TRACKMANAGER.getTrack(new Track().FromDB(track)) as Track);
        return this;
    }
}