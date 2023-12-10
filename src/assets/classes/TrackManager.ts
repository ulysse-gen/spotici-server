//TrackManager Class
import _ from 'lodash';
import Track from './Track';
import db from '../db';
import Album from './Album';

export default class TrackManager {
    public tracks: Map<string, Track>;
    constructor() {
        this.tracks = new Map();
    }

    getTrack(Track: Track): Track {
        if (Track.id) {
            if (this.tracks.get(Track.id)){
                if (!this.tracks.get(Track.id)?.album && Track.album || !this.tracks.get(Track.id)?.artists && Track.artists){
                    this.addTrack(Track);
                    return Track;
                }
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

    async searchIdDB(TrackID: string) {
        return db.query(`SELECT track.*, album.name AS albumName, 
        JSON_ARRAYAGG(JSON_OBJECT('name', artist.name, 'id', artist.id)) OVER (PARTITION BY track.id) AS artists,
        JSON_OBJECT('name', album.name, 'id', album.id, 'release_date', album.release_date, 'release_date_precision', album.release_date_precision, 'artists',
            (SELECT JSON_ARRAYAGG(JSON_OBJECT('name', artist.name, 'id', artist.id)) OVER (PARTITION BY album.id))
        ) AS album
        FROM tracks AS track
        JOIN album_track ON (album_track.trackId = track.id)
        JOIN albums AS album ON (album.id = album_track.albumId)
        JOIN album_artist ON (album_artist.albumId = album.id)
        JOIN artists AS artist ON (artist.id = album_artist.artistId)
        WHERE track.id = ?
        GROUP BY track.id, album.id, artist.id;`, [TrackID]);
    }

    async searchQueryDB(Query: string, amount = 10, from = 0) {
        return await db.query(`SELECT track.*, album.name AS albumName, 
        JSON_ARRAYAGG(JSON_OBJECT('name', artist.name, 'id', artist.id)) OVER (PARTITION BY track.id) AS artists,
        JSON_OBJECT('name', album.name, 'id', album.id, 'release_date', album.release_date, 'release_date_precision', album.release_date_precision, 'artists',
            (SELECT JSON_ARRAYAGG(JSON_OBJECT('name', artist.name, 'id', artist.id)) OVER (PARTITION BY album.id))
        ) AS album
        FROM tracks AS track
        JOIN album_track ON (album_track.trackId = track.id)
        JOIN albums AS album ON (album.id = album_track.albumId)
        JOIN album_artist ON (album_artist.albumId = album.id)
        JOIN artists AS artist ON (artist.id = album_artist.artistId)
        WHERE track.name LIKE ? OR album.name LIKE ? OR artist.name LIKE ?
        GROUP BY track.id, album.id, artist.id
        LIMIT ${from}, ${amount};`, [`%${Query}%`, `%${Query}%`, `%${Query}%`]);
    }

    async createTracksOnDB(Tracks: Array<Track>) {
        let Queries = Tracks.map(Track => { return { 
            sql: 'INSERT INTO tracks (`id`, `track_number`, `disc_number`, `name`, `explicit`, `duration_ms`) SELECT ?, ?, ?, ?, ?, ? WHERE NOT EXISTS (SELECT id FROM tracks WHERE id=?);', params: [Track.id, Track.track_number, Track.disc_number, Track.name, Track.explicit, Track.duration_ms, Track.id]
        }});
        return db.queryTransaction(Queries);
    }

    async createJunctionsOnDB(Tracks: Array<Track>) {
        let Queries = Tracks.filter(Track => Track.album).map(Track => { return { 
            sql: `INSERT INTO album_track (albumId, trackId) SELECT '${(Track.album as Album).id}', '${Track.id}'  WHERE NOT EXISTS (SELECT albumId FROM album_track WHERE albumId='${(Track.album as Album).id}' AND trackId='${Track.id}')`
        }});
        return db.queryTransaction(Queries);
    }
}