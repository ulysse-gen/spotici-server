import * as socketio from 'socket.io';
import jwt, { JwtPayload } from 'jsonwebtoken';

import disconnect from './disconnect';
import db from '../assets/API/v1/middlewares/db';
import User from '../assets/classes/User';


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
            const UserQuery = (await db.query(`SELECT * FROM \`users\` WHERE username = ?;`, [socket.JWT.User]) as Array<SpotIci.DBClient>);
            if (UserQuery.length == 0) return socket.disconnectWithReason('Invalid token.');
            const user = new User(UserQuery[0]);
            socket.User = user;
            if (await user.IsTokenInvalid((decoded as JwtPayload).tokenIdentifier)) return socket.disconnectWithReason('Invalid token.');
            let UserSockets = socket.SERVER?.clients.get(user.username) || [];
            UserSockets?.push(socket);
            socket.SERVER?.clients.set(user.username, UserSockets);
            console.log(`${socket.User.nickname} connected to the server, ${UserSockets.length} current connections.`);
        } catch(error) {
            console.log(error)
            return socket.disconnectWithReason('Invalid token.');
        }
        socket.on('disconnect', (data) => disconnect(socket, data));
    })
}