//User Class
import bcrypt from 'bcrypt';
import _ from 'lodash';

export default class User {
    private numId!: number;
    public username!: string;
    public nickname!: string;
    public email!: string;
    private password!: string;
    private permissionLevel!: number;
    private invalidatedTokens!: Array<string>;
    private creationTimestamp!: Date;
    private updateTimestamp!: Date;
    private accountState!: string;
    public profilePicture!: string;
    constructor(DBClient?: SpotIci.DBClient) {
        if (DBClient)this.FromDBClient(DBClient);
    }

    async CheckPassword(Password: string, Function: Function) {
        bcrypt.compare(Password, this.password, (err, res) => Function(err, res));
    }

    async IsTokenInvalid(Token: string) {
        return this.invalidatedTokens.includes(Token);
    }

    GetPermissionLevel(){
        return this.permissionLevel;
    }

    FromDBClient(DBClient: SpotIci.DBClient){
        this.numId = DBClient.numId;
        this.username = DBClient.username;
        this.nickname = DBClient.nickname;
        this.email = DBClient.email;
        this.password = DBClient.password;
        this.permissionLevel = DBClient.permissionLevel;
        this.invalidatedTokens = JSON.parse(DBClient.invalidatedTokens);
        this.creationTimestamp = DBClient.creationTimestamp;
        this.updateTimestamp = DBClient.updateTimestamp;
        this.accountState = DBClient.accountState;
        this.profilePicture = DBClient.profilePicture;
        return this;
    }

    ToClientClient() {
        return _.omit(this, ["numId", "password", "invalidatedTokens", "creationTimestamp", "updateTimestamp", "accountState"]);
    }
}