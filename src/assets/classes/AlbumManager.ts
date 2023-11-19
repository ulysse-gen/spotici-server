//TrackManager Class
import _ from 'lodash';
import db from '../API/v1/middlewares/db';
import Album from './Album';

export default class AlbumManager {
    public albums: Map<string, Album>;
    constructor() {
        this.albums = new Map();
    }

    getAlbum(Album: Album): Album {
        if (Album.id) {
            if (this.albums.get(Album.id)){
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
        return await db.query("SELECT * FROM albums WHERE id = ?", [AlbumId]);
    }

    async searchQueryDB(Query: string) {
        return await db.query("SELECT * FROM albums WHERE name LIKE ?", [`%${Query}%`]);
    }

    async createAlbumOnDB(Album: Album) {
        return db.execute('INSERT INTO `albums` (`id`, `name`, `artists`, `artistsNames`, `release`, `total_tracks`, `image`) SELECT ?, ?, ?, ?, ?, ?, ? WHERE NOT EXISTS (SELECT id FROM `albums` WHERE `id`=?)', [Album.id, Album.name, JSON.stringify(Album.artists.map(artist => artist.id)), JSON.stringify(Album.artists.map(artist => artist.name)), Album.release, Album.total_tracks, Album.image, Album.id]);
    }

    async createAlbumsOnDB(Albums: Array<Album>) {
        let Queries = Albums.map(Album => { return { sql: 'INSERT INTO `albums` (`id`, `name`, `artists`, `artistsNames`, `release`, `total_tracks`, `image`) SELECT ?, ?, ?, ?, ?, ?, ? WHERE NOT EXISTS (SELECT id FROM `albums` WHERE `id`=?)', params: [Album.id, Album.name, JSON.stringify(Album.artists.map(artist => artist.id)), JSON.stringify(Album.artists.map(artist => artist.name)), Album.release, Album.total_tracks, Album.image, Album.id]}});
        return db.queryTransaction(Queries);
    }
}