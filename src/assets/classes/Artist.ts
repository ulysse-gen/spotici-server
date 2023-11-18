//Artist Class
import _ from 'lodash';

export default class Artist {
    public id!: string;
    public name!: string;
    constructor() {
    }

    FromSpotify(ArtistObjet: SpotifyApi.ArtistObjectSimplified) {
        this.id = ArtistObjet.id;
        this.name = ArtistObjet.name;
        return this;
    }

    async FromDB(ArtistObjet: SpotIci.DBArtist) {
        this.id = ArtistObjet.id;
        this.name = ArtistObjet.name;
        return this;
    }
}