//User Class
import bcrypt from 'bcrypt';
import _ from 'lodash';
import db from '../db';
import { Socket } from 'socket.io';

export default class User {
    public id: number;
    public username: string;
    public nickname: string;
    public email: string;
    private password: string;
    public creationTimestamp: Date;
    public updateTimestamp: Date;
    public state: string;
    public images: [{size: string, url: string}]
    public sockets: Map<string, Socket>;
    constructor(DBClient: SpotIci.ClientObject) {
        this.id = DBClient.id;
        this.username = DBClient.username;
        this.nickname = DBClient.nickname;
        this.email = DBClient.email;
        this.password = DBClient.password;
        this.creationTimestamp = new Date(DBClient.creationTimestamp);
        this.updateTimestamp = new Date(DBClient.updateTimestamp);
        this.state = DBClient.state;
        this.images = DBClient.images;
        this.sockets = new Map();
    }

    addSocket(Socket: Socket) {
        this.sockets.set(Socket.id, Socket);
        return this;
    }

    removeSocket(Socket: Socket) {
        this.sockets.delete(Socket.id);
        return this;
    }

    createSocket(Socket: SpotIci.Socket) {
        Array.from(this.sockets.values()).filter(socket => socket.id != Socket.id).forEach(socket => {
            socket.emit('newplayer', Socket.data);
        });
    }

    deleteSocket(Socket: SpotIci.Socket) {
        Array.from(this.sockets.values()).filter(socket => socket.id != Socket.id).forEach(socket => {
            socket.emit('deleteplayer', Socket.data.UUID);
        });
    }

    syncSocket(Socket: SpotIci.Socket) {
        Array.from(this.sockets.values()).filter(socket => socket.id != Socket.id).forEach(socket => {
            socket.emit('syncplayer', Socket.data);
        });
    }

    sendCurrentSockets(Socket: SpotIci.Socket) {
        Array.from(this.sockets.values()).filter(socket => socket.id != Socket.id).forEach(socket => {
            Socket.emit('newplayer', socket.data);
        });
    }

    async GetPermissionLevel(): Promise<number> {
        let UserPermissionLevel = await db.execute(`
        SELECT permission.permission 
        FROM permissions AS permission
        JOIN users AS user ON (user.id = permission.userId) 
        WHERE user.id = ?;`, [this.id]);
        return UserPermissionLevel[0].permission;
    }

    ToClient() {
        return _.omit(this, ["id", "password"]);
    }

    async CheckPassword(Password: string, Function: Function) {
        bcrypt.compare(Password, this.password, (err, res) => Function(err, res));
    }

    async PushToken(TokenId: string, expiresIn: number){
        await db.execute(`
        INSERT INTO tokens (id, userId, expiresAt)
        VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? SECOND));`, [TokenId, this.id, expiresIn]);
    }

    async InvalidateToken(Token: string) {
        await db.execute(`
        UPDATE tokens SET state = 'invalidated'
        FROM tokens
        JOIN users AS user ON (user.id = ?)
        WHERE tokens.id = ?;`, [this.id, Token]);
        return;
    }

    async IsTokenInvalid(Token: string) {
        let UserToken = await db.execute(`SELECT token.id
        FROM users AS user
        JOIN tokens AS token ON (token.userId = user.id)
        WHERE user.id = ? AND token.id = ? AND token.state = 'active';`, [this.id, Token]);
        if (UserToken[0])return false;
        return true;
    }
}