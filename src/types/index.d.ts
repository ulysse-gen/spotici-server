import { JwtPayload } from "jsonwebtoken";
import API from "../assets/classes/API";
import { i18n } from "i18next";
import User from "../assets/classes/User";
import * as socketio from "socket.io";
import SServer from "../assets/classes/Socket";

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
    interface DBClient {
      numId: number;
      username: string;
      nickname: string;
      email: string;
      password: string;
      permissionLevel: number;
      invalidatedTokens: string;
      creationTimestamp: Date;
      updateTimestamp: Date;
      accountState: string;
      profilePicture: string;
    }

    interface DBTrack {
      numId: number;
      id: string;
      name: string;
      album: string;
      albumName: string;
      artists: string;
      artistsNames: string;
      duration_ms: number;
      release: string;
      track_number: number;
      disc_number: number;
    }

    interface DBAlbum {
      numId: number;
      id: string;
      name: string;
      artists: string;
      artistsNames: string;
      release: string;
      total_tracks: number;
      image: string | undefined;
    }

    interface DBArtist {
      numId: number;
      id: string;
      name: string;
      image?: string;
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
      User?: User;
      disconnectWithReason?: function;
    }

    interface Server extends socketio.Server {
      API?: API;
      SERVER?: SServer;
    }
  }
}
