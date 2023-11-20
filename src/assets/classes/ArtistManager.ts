//TrackManager Class
import _ from 'lodash';
import db from '../API/v1/middlewares/db';
import Artist from './Artist';

export default class ArtistManager {
    public artists: Map<string, Artist>;
    constructor() {
        this.artists = new Map();
    }

    getArtist(Artist: Artist): Artist {
        if (Artist.id) {
            if (this.artists.get(Artist.id)){
                return this.artists.get(Artist.id) as Artist;
            }else {
                this.addArtist(Artist);
            }
        }
        return Artist;
    }

    addArtist(Artist: Artist) {
        this.artists.set(Artist.id, Artist);
        return Artist;
    }

    removeArtist(Artist: Artist) {
        this.artists.delete(Artist.id);
        return Artist;
    }
    
    async getArtistById(ArtistID: string): Promise<Artist> {
        if (this.artists.get(ArtistID))return this.artists.get(ArtistID) as Artist;
        let FetchedArtist = await new Artist().FromDB((await this.searchIdDB(ArtistID))[0]);
        this.artists.set(FetchedArtist.id, FetchedArtist);
        return FetchedArtist;
    }

    async searchIdDB(ArtistID: string) {
        return db.query("SELECT * FROM artists WHERE id = ?", [ArtistID]);
    }

    async searchQueryDB(Query: string, amount = 10, from = 0) {
        return db.query(`SELECT * FROM artists WHERE name LIKE ? LIMIT ${from}, ${amount}`, [amount, `%${Query}%`]);
    }

    async createArtistOnDB(Artist: Artist) {
        return db.execute('INSERT INTO `artists` (`id`, `name`) SELECT ?, ? WHERE NOT EXISTS (SELECT id FROM `artists` WHERE `id`=?)', [Artist.id, Artist.name, Artist.id]);
    }

    async createArtistsOnDB(Artists: Array<Artist>) {
        let Queries = Artists.map(Artist => { return { sql: 'INSERT INTO `artists` (`id`, `name`) SELECT ?, ? WHERE NOT EXISTS (SELECT id FROM `artists` WHERE `id`=?)', params: [Artist.id, Artist.name, Artist.id]}});
        return db.queryTransaction(Queries);
    }
}