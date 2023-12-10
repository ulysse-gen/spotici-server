import * as socketio from 'socket.io';
import User from '../assets/classes/User';
import Track from '../assets/classes/Track';
import { SPOTICI_USERMANAGER } from '..';

export default function (socket: SpotIci.Socket, data: {UUID: string, isPlaying: boolean, name: string, volume: number, progression: number, track: Track}) {
    let user = SPOTICI_USERMANAGER.getUserBySocket(socket);
    if (!user)return;
    socket.data = data;
    //console.log(`${user.nickname} updated player ${data.UUID}.`);
}