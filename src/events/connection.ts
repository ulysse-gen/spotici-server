import * as socketio from 'socket.io';
import jwt, { JwtPayload } from 'jsonwebtoken';

import disconnect from './disconnect';
import db from '../assets/db';
import User from '../assets/classes/User';
import { SPOTICI_USERMANAGER } from '..';


export default function (socket: SpotIci.Socket) {
    if (!socket.handshake.headers['authorization'])return socket.disconnectWithReason('Missing authorization.');
    let token = socket.handshake.headers['authorization'];
    if (!!token && token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }

    jwt.verify(token, socket.API?.secret || "", async (err, decoded) => {
        if (err) {
            console.log(err)
            return socket.disconnectWithReason('Invalid token.');
        }
        socket.JWT = decoded as SpotIci.JWT;

        try {
            const UserQuery = (await db.query(`SELECT * FROM \`users\` WHERE username = ?;`, [socket.JWT.User]) as Array<SpotIci.ClientObject>);
            if (UserQuery.length == 0) return socket.disconnectWithReason('Invalid token.');
            const user = SPOTICI_USERMANAGER.getUser(new User(UserQuery[0])).addSocket(socket);
            if (await user.IsTokenInvalid((socket.JWT as JwtPayload).tokenIdentifier)) return socket.disconnectWithReason('Invalid token.');
            socket.use((event, next) => {
                SPOTICI_USERMANAGER.getUserBySocket(socket);
                next();
            });

            console.log(`${user.nickname} connected to the socket, ${user.sockets.size} current connections.`);
            socket.emit('authed', crypto.randomUUID());
        } catch(error) {
            console.log(error)
            return socket.disconnectWithReason('Invalid token.');
        }
        socket.on('disconnect', (data) => disconnect(socket, data));
    })
}