import { JwtPayload } from "jsonwebtoken";
import API from "../assets/classes/API";
import { i18n } from "i18next";
import User from "../assets/classes/User";
import * as socketio from "socket.io";
import SServer from "../assets/classes/Socket";
import Track from "../assets/classes/Track";

export {};

declare global {
  namespace Express {
    interface Request {
      API: API;
      i18n: i18n;
      User: User;
      headers?: Array<String>;
      JWT?: JwtPayload | string;
    }
  }

  namespace SpotIci {

    interface ClientObject {
      id: number;
      username: string;
      nickname: string;
      email: string;
      password: string;
      creationTimestamp: string;
      updateTimestamp: string;
      state: string;
      images: [{size: string, url: string}];
    }


    interface TrackObjectSimplified {
      id: string;
      track_number: number;
      disc_number: number;
      name: string;
      explicit: boolean;
      duration_ms: number;
      album: AlbumObjectSimplified;
      artists: Array<ArtistObjectSimplified>
    }

    interface AlbumObjectSimplified {
      id: string;
      name: string;
      release_date: string;
      release_date_precision: string;
      artists: Array<ArtistObjectSimplified>
      tracks: Array<TrackObjectSimplified>
    }

    interface ArtistObjectSimplified {
      id: string;
      name: string;
      albums: Array<AlbumObjectSimplified>;
      tracks: Array<TrackObjectSimplified>
    }

    interface FileTrack {
      title: string;
      album: string;
      artist: string;
      path: string;
    }

    interface JWT {
      tokenIdentifier: string;
      username: string;
    }

    interface Socket extends socketio.Socket {
      API?: API;
      SERVER?: SServer;
      JWT?: uGameClientToken;
      USER?: User;
      disconnectWithReason?: function;
      data: {
        isPlaying?: boolean;
        name?: string;
        volume?: number;
        progression?: number;
        track?: Track;
        UUID: string;
      }
    }

    interface Server extends socketio.Server {
      API?: API;
      SERVER?: SServer;
    }
  }
}
