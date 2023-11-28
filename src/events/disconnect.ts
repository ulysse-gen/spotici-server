import * as socketio from 'socket.io';
import User from '../assets/classes/User';

export default function (socket: SpotIci.Socket, reason: socketio.DisconnectReason) {
    let UserSockets = socket.SERVER?.clients.get((socket.User as User).username) || [];
    UserSockets = UserSockets?.filter(subSocket => socket.id != subSocket.id);
    socket.SERVER?.clients.set((socket.User as User).username, UserSockets);
    console.log(`${socket.User?.nickname} disconnected, reason: ${reason}.`);
}