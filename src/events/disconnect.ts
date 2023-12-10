import * as socketio from 'socket.io';
import User from '../assets/classes/User';
import { SPOTICI_USERMANAGER } from '..';

export default function (socket: SpotIci.Socket, reason: socketio.DisconnectReason) {
    let user = SPOTICI_USERMANAGER.getUserBySocket(socket);
    if (!user)return;
    user.removeSocket(socket);
    user.deleteSocket(socket);
    console.log(`${user.nickname} disconnected, reason: ${reason}.`);
}