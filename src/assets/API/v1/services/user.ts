import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import express from 'express';
import db from '../middlewares/db';
import User from '../../../classes/User';

export async function auth (req: express.Request, res: express.Response, next: express.NextFunction) {
    const { username, password } = req.body;

    //let passwordHashed = bcrypt.hashSync(password, 10);

    if (!username)return res.status(400).json({
        name   : req.t('name'), 
        status : 400, 
        message: req.t('route.user.auth.email_or_username_required')
    });
    if (!password)return res.status(400).json({
        name   : req.t('name'), 
        status : 400, 
        message: req.t('route.user.auth.password_required')
    });

    try {
        const UserQuery = (await db.query(`SELECT * FROM \`users\` WHERE username = ?;`, [username])) as Array<SpotIci.DBClient>;
        if (UserQuery.length == 0) return res.status(401).json({
            name   : req.t('name'), 
            status : 401, 
            message: req.t('route.user.auth.user_not_found')
        });
        const user = new User(UserQuery[0]);
        

        user.CheckPassword(password, function(err, response) {
            if (err) return res.status(500).json({
                name   : req.t('name'), 
                status : 500, 
                message: req.t('route.error.500')
            });


            if (response) {
                const expireIn = 24 * 60 * 60;
                const token    = jwt.sign({
                    tokenIdentifier: crypto.randomBytes(8).toString('hex'),
                    User: user.username
                },
                req.API.secret,
                {
                    expiresIn: expireIn
                });

                res.header('Authorization', 'Bearer ' + token);

                return res.status(200).setHeader('Authorization', "Bearer " + token).json({
                    name   : req.t('name'), 
                    status : 200, 
                    message: req.t('route.user.auth.logged_in'),
                    data: {
                        username: user.username, token: {access_token: token, expireIn}
                    }
                });
            }

            return res.status(401).json({
                name   : req.t('name'), 
                status : 401, 
                message: req.t('route.user.auth.could_not_login')
            });
        });
    } catch(error) {
        console.log(error)
        return res.status(500).json({
            name   : req.t('name'), 
            status : 500, 
            message: req.t('route.error.500')
        });
    }
}

export async function register (req: express.Request, res: express.Response, next: express.NextFunction) {
    const { username, email, password, password_verify } = req.body;

    if (!username)return res.status(400).json({
        name   : req.t('name'), 
        status : 400, 
        message: req.t('route.user.auth.username_required')
    });
    if (!email)return res.status(400).json({
        name   : req.t('name'), 
        status : 400, 
        message: req.t('route.user.auth.email_required')
    });
    if (!password)return res.status(400).json({
        name   : req.t('name'), 
        status : 400, 
        message: req.t('route.user.auth.password_required')
    });
    if (!password_verify)return res.status(400).json({
        name   : req.t('name'), 
        status : 400, 
        message: req.t('route.user.auth.password_verify_required')
    });

    if (password != password_verify)return res.status(400).json({
        name   : req.t('name'), 
        status : 400, 
        message: req.t('route.user.auth.password_and_verify_do_not_match')
    });

    try {
        const user = (await db.query("SELECT * FROM `users` WHERE `username` = ? OR `email` = ?;", [username, email])) as Array<SpotIci.DBClient>;
        if (user.length != 0) {
            if (user[0].email == email){
                return res.status(401).json({
                    name   : req.t('name'), 
                    status : 401, 
                    message: req.t('route.user.auth.email_already_registered')
                });
            } else if (user[0].username == username)return res.status(401).json({
                name   : req.t('name'), 
                status : 401, 
                message: req.t('route.user.auth.username_taken')
            });
        }

        const hashedPassword = await bcrypt.hash(password, 11);
        await db.execute("INSERT INTO `users` (`username`, `nickname`, `email`, `password`) VALUES (?, ?, ?, ?);", [username, username, email, hashedPassword]);

        return res.status(200).json({
            name   : req.t('name'), 
            status : 200, 
            message: req.t('route.user.auth.registered')
        });
    } catch(error) {
        console.log(error)
        return res.status(500).json({
            name   : req.t('name'), 
            status : 500, 
            message: req.t('route.error.500')
        });
    }
}

export async function getUserByUsername (req: express.Request, res: express.Response) {
    const { username } = req.params;

    if (!username)return res.status(400).json({
        name   : req.t('name'), 
        status : 400, 
        message: req.t('route.user.getUserByUsername.username_required')
    });

    const UserQuery = (await db.query(`SELECT * FROM \`users\` WHERE username = ?;`, [username])) as Array<SpotIci.DBClient>;
    if (UserQuery.length == 0) return res.status(401).json({
        name   : req.t('name'), 
        status : 401, 
        message: req.t('route.user.@.user_not_found')
    });
    const user = new User(UserQuery[0]);
    return res.status(200).json({
        name   : req.t('name'), 
        status : 200, 
        message: req.t('route.user.@.success'),
        data: user.ToClientClient()
    });
}

export async function getMine (req: express.Request, res: express.Response, next: express.NextFunction) {
    req.params.username = req.User.username;
    next();
}