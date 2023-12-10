//TrackManager Class
import _ from 'lodash';
import db from '../db';
import User from './User';
import { Socket } from 'socket.io';

export default class UserManager {
    public users: Map<string, User>;
    constructor() {
        this.users = new Map();
    }

    getUserBySocket(socket: Socket) {
        let UserId = Array.from(this.users.keys()).find(key => {
            return this.users.get(key)?.sockets.has(socket.id)
        });
        if (!UserId)return undefined;
        return this.users.get(UserId);
    }

    getUserById(UserID: string) {
        if (this.users.get(UserID))return this.users.get(UserID);
        return undefined;
    }

    getUser(User: User): User {
        if (User.id) {
            if (this.users.get(User.id.toString())){
                return this.users.get(User.id.toString()) as User;
            }else {
                this.addUser(User);
            }
        }
        return User;
    }

    addUser(User: User) {
        this.users.set(User.id.toString(), User);
        return User;
    }

    removeUser(User: User) {
        this.users.delete(User.id.toString());
        return User;
    }
}