//TrackManager Class
import _ from 'lodash';
import db from '../db';
import Artist from './Artist';

export default class ArtistManager {
    public artists: Map<string, Artist>;
    constructor() {
        this.artists = new Map();
    }

    getArtist(Artist: Artist): Artist {
        if (Artist.id) {
            if (this.artists.get(Artist.id)){
                if (!this.artists.get(Artist.id)?.albums && Artist?.albums || !this.artists.get(Artist.id)?.tracks && Artist.tracks){
                    this.addArtist(Artist);
                    return Artist;
                }
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
        return db.query(`SELECT artist.*, 
        JSON_ARRAYAGG(JSON_OBJECT('name', album.name, 'id', album.id, 'release_date', album.release_date, 'release_date_precision', album.release_date_precision, 'artists',
            (SELECT JSON_ARRAYAGG(JSON_OBJECT('name', artist.name, 'id', artist.id)) OVER (PARTITION BY album.id))
        )) OVER (PARTITION BY artist.id) AS albums,
        JSON_ARRAYAGG(JSON_OBJECT('name', tracks.name, 'id', tracks.id, 'track_number', tracks.track_number, 'disc_number', tracks.disc_number, 'explicit', tracks.explicit, 'duration_ms', tracks.duration_ms)) OVER (PARTITION BY artist.id) AS tracks
        FROM artists AS artist
        JOIN album_artist ON (album_artist.artistId = artist.id)
        JOIN albums AS album ON (album.id = album_artist.albumId)
        JOIN album_track ON (album_track.albumId = album.id)
        JOIN tracks ON (tracks.id = album_track.trackId)
        WHERE artist.id = ?
        GROUP BY tracks.id, album.id, artist.id;`, [ArtistID]);
    }

    async searchQueryDB(Query: string, amount = 10, from = 0) {
        return await db.query(`SELECT artist.*, 
        JSON_ARRAYAGG(JSON_OBJECT('name', album.name, 'id', album.id, 'release_date', album.release_date, 'release_date_precision', album.release_date_precision, 'artists',
            (SELECT JSON_ARRAYAGG(JSON_OBJECT('name', artist.name, 'id', artist.id)) OVER (PARTITION BY album.id))
        )) OVER (PARTITION BY artist.id) AS albums,
        JSON_ARRAYAGG(JSON_OBJECT('name', tracks.name, 'id', tracks.id, 'track_number', tracks.track_number, 'disc_number', tracks.disc_number, 'explicit', tracks.explicit, 'duration_ms', tracks.duration_ms)) OVER (PARTITION BY artist.id) AS tracks
        FROM artists AS artist
        JOIN album_artist ON (album_artist.artistId = artist.id)
        JOIN albums AS album ON (album.id = album_artist.albumId)
        JOIN album_track ON (album_track.albumId = album.id)
        JOIN tracks ON (tracks.id = album_track.trackId)
        WHERE tracks.name LIKE ? OR album.name LIKE ? OR artist.name LIKE ?
        GROUP BY tracks.id, album.id, artist.id
        LIMIT ${from}, ${amount}`, [`%${Query}%`, `%${Query}%`, `%${Query}%`]);
    }

    async createArtistOnDB(Artist: Artist) {
        return db.execute('INSERT INTO `artists` (`id`, `name`) SELECT ?, ? WHERE NOT EXISTS (SELECT id FROM `artists` WHERE `id`=?)', [Artist.id, Artist.name, Artist.id]);
    }

    async createArtistsOnDB(Artists: Array<Artist>) {
        let Queries = Artists.map(Artist => { return { sql: 'INSERT INTO `artists` (`id`, `name`) SELECT ?, ? WHERE NOT EXISTS (SELECT id FROM `artists` WHERE `id`=?)', params: [Artist.id, Artist.name, Artist.id]}});
        return db.queryTransaction(Queries);
    }
}