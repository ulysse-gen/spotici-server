//TrackManager Class
import _ from 'lodash';
import Track from './Track';
import db from '../API/v1/middlewares/db';

export default class TrackManager {
    public tracks: Map<string, Track>;
    constructor() {
        this.tracks = new Map();
    }

    getTrack(Track: Track): Track {
        if (Track.id) {
            if (this.tracks.get(Track.id)){
                return this.tracks.get(Track.id) as Track;
            }else {
                this.addTrack(Track);
            }
        }
        return Track;
    }

    addTrack(Track: Track) {
        this.tracks.set(Track.id, Track);
    }

    removeTrack(Track: Track) {
        this.tracks.delete(Track.id);
    }
    
    async getTrackById(TrackID: string): Promise<Track> {
        if (this.tracks.get(TrackID))return this.tracks.get(TrackID) as Track;
        let FetchedTrack = await new Track().FromDB((await this.searchIdDB(TrackID))[0]);
        this.tracks.set(FetchedTrack.id, FetchedTrack);
        return FetchedTrack;
    }

    async searchIdDB(ArtistID: string) {
        return db.query("SELECT * FROM tracks WHERE id = ?", [ArtistID]);
    }

    async searchQueryDB(Query: string, amount = 10, from = 0) {
        return await db.query(`SELECT * FROM tracks WHERE name LIKE ? OR albumName LIKE ? OR artistsNames LIKE ? LIMIT ${from}, ${amount}`, [amount, `%${Query}%`, `%${Query}%`, `%${Query}%`]);
    }

    async createTrackOnDB(Track: Track) {
        return db.execute('INSERT INTO `tracks` (`id`, `name`, `album`, `albumName`, `artists`, `artistsNames`, `duration_ms`, `release`, `disc_number`, `track_number`) SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ? WHERE NOT EXISTS (SELECT id FROM `tracks` WHERE `id`=?)', [Track.id, Track.name, Track.album.id, Track.album.name, JSON.stringify(Track.artists.map(artist => artist.id)), JSON.stringify(Track.artists.map(artist => artist.name)), Track.duration_ms, Track.release, Track.disc_number, Track.track_number, Track.id]);
    }

    async createTracksOnDB(Tracks: Array<Track>) {
        let Queries = Tracks.map(Track => { return { sql: 'INSERT INTO `tracks` (`id`, `name`, `album`, `albumName`, `artists`, `artistsNames`, `duration_ms`, `release`, `disc_number`, `track_number`) SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ? WHERE NOT EXISTS (SELECT id FROM `tracks` WHERE `id`=?)', params: [Track.id, Track.name, Track.album.id, Track.album.name, JSON.stringify(Track.artists.map(artist => artist.id)), JSON.stringify(Track.artists.map(artist => artist.name)), Track.duration_ms, Track.release, Track.disc_number, Track.track_number, Track.id]}});
        return db.queryTransaction(Queries);
    }
}