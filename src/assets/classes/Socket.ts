//Server class
import * as socketio from 'socket.io';
import cors from 'cors';
import express from 'express';
import http from 'http';

import { SPOTICI_API } from "../../index";
import API from './API';

//Events
import ConnectionEvent from '../../events/connection';

export default class Server {
    private app: express.Express;
    private server: http.Server;
    private io: SpotIci.Server;
    private port: number;
    public API: API;
    public clients: Map<string, Array<SpotIci.Socket>>;
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = new socketio.Server(this.server, {
            cors: {
              origin: "*",
              methods: ["GET", "POST"]
            }
        });

        this.API = SPOTICI_API;
        this.io.SERVER = this;

        this.port = 4000;

        this.clients = new Map<string, Array<SpotIci.Socket>>;
    }

    Start() {
        this.app.use(cors());
        this.app.get('/', (req, res) => res.status(200));

        this.io.use((socket: SpotIci.Socket, next) => {
            socket.API = this.API;
            socket.SERVER = this;
            socket.disconnectWithReason = (reason: string) => {
                socket.emit('kicked', reason);
                socket.disconnect();
                return;
            }
            next();
        });

        this.io.on('connection', ConnectionEvent);

        this.server.listen(this.port, () => {
            console.log(`Socket server listening on ${this.port}`);
        });
    }
}