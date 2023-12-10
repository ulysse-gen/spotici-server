//TrackManager Class
import _ from 'lodash';
import db from '../db';
import Album from './Album';

export default class AlbumManager {
    public albums: Map<string, Album>;
    constructor() {
        this.albums = new Map();
    }

    getAlbum(Album: Album): Album {
        if (Album.id) {
            if (this.albums.get(Album.id)){
                if (!this.albums.get(Album.id)?.artists && Album?.artists || !this.albums.get(Album.id)?.tracks && Album.tracks){
                    this.addAlbum(Album);
                    return Album;
                }
                return this.albums.get(Album.id) as Album;
            }else {
                this.addAlbum(Album);
            }
        }
        return Album;
    }

    addAlbum(Album: Album) {
        this.albums.set(Album.id, Album);
        return Album;
    }

    removeAlbum(Album: Album) {
        this.albums.delete(Album.id);
        return Album;
    }

    async getAlbumById(AlbumId: string): Promise<Album> {
        if (this.albums.get(AlbumId))return this.albums.get(AlbumId) as Album;
        let FetchedAlbum = await new Album().FromDB((await this.searchIdDB(AlbumId))[0]);
        this.albums.set(FetchedAlbum.id, FetchedAlbum);
        return FetchedAlbum;
    }

    async searchIdDB(AlbumId: string) {
        return await db.query(`SELECT album.*, album.name AS albumName, SUM(tracks.id) OVER (PARTITION BY album.id) AS total_tracks,
        JSON_ARRAYAGG(JSON_OBJECT('name', artist.name, 'id', artist.id)) OVER (PARTITION BY album.id) AS artists,
        JSON_ARRAYAGG(JSON_OBJECT('name', tracks.name, 'id', tracks.id, 'track_number', tracks.track_number, 'disc_number', tracks.disc_number, 'explicit', tracks.explicit, 'duration_ms', tracks.duration_ms)) OVER (PARTITION BY album.id) AS tracks
        FROM albums AS album
        JOIN album_track ON (album_track.albumid = album.id)
        JOIN album_artist ON (album_artist.albumId = album.id)
        JOIN artists AS artist ON (artist.id = album_artist.artistId)
        JOIN tracks ON (tracks.id = album_track.trackId)
        WHERE album.id = ?
        GROUP BY tracks.id, album.id, artist.id`, [AlbumId]);
    }

    async searchQueryDB(Query: string, amount = 10, from = 0) {
        return await db.query(`SELECT album.*, album.name AS albumName, SUM(tracks.id) OVER (PARTITION BY album.id) AS total_tracks,
        JSON_ARRAYAGG(JSON_OBJECT('name', artist.name, 'id', artist.id)) OVER (PARTITION BY album.id) AS artists,
        JSON_ARRAYAGG(JSON_OBJECT('name', tracks.name, 'id', tracks.id, 'track_number', tracks.track_number, 'disc_number', tracks.disc_number, 'explicit', tracks.explicit, 'duration_ms', tracks.duration_ms)) OVER (PARTITION BY album.id) AS tracks
        FROM albums AS album
        JOIN album_track ON (album_track.albumid = album.id)
        JOIN album_artist ON (album_artist.albumId = album.id)
        JOIN artists AS artist ON (artist.id = album_artist.artistId)
        JOIN tracks ON (tracks.id = album_track.trackId)
        WHERE tracks.name LIKE ? OR album.name LIKE ? OR artist.name LIKE ?
        GROUP BY tracks.id, album.id, artist.id
        LIMIT ${from}, ${amount}`, [`%${Query}%`, `%${Query}%`, `%${Query}%`]);
    }

    async createAlbumsOnDB(Albums: Array<Album>) {
        let Queries = Albums.map(Album => { return { 
            sql: 'INSERT INTO albums (`id`, `name`, `release_date`, `release_date_precision`) SELECT ?, ?, ?, ? WHERE NOT EXISTS (SELECT id FROM albums WHERE id=?);', params: [Album.id, Album.name, Album.release_date, Album.release_date_precision, Album.id]
        }});
        return db.queryTransaction(Queries);
    }

    async createJunctionsOnDB(Albums: Array<Album>) {
        let Queries = Albums.map(Album => Album.artists.map(artist => { return {
            sql: `INSERT INTO album_artist (albumId, artistId) SELECT '${Album.id}', '${artist.id}'  WHERE NOT EXISTS (SELECT albumId FROM album_artist WHERE albumId='${Album.id}' AND artistId='${artist.id}');`
        }})).flat();
        return db.queryTransaction(Queries);
    }
}