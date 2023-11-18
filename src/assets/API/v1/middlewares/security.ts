import jwt, { JwtPayload } from 'jsonwebtoken';
import express from "express";
import db from './db';
import User from '../../../classes/User';

export const PermissionLevel = {
    'SYSTEM': 500,
    'DEV': 250,
    'ADMIN': 100,
    'MOD': 50,
    'USER': 10
}

export function checkJWT (req: express.Request, res: express.Response, next: express.NextFunction) {
    let token = (req.headers['x-access-token'] || req.headers['authorization']) as string;
    if (!!token && token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }

    if (token) {
        jwt.verify(token, req.API.secret, async (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    name   : req.t('name'), 
                    status : 401, 
                    message: req.t('security.invalid_token')
                });
            } else {
                try {
                    req.JWT = decoded as SpotIci.JWT;
                    const UserQuery = (await db.query(`SELECT * FROM \`users\` WHERE username = ?;`, [req.JWT.User]) as Array<SpotIci.DBClient>);
                    if (UserQuery.length == 0) return res.status(401).json({
                        name   : req.t('name'), 
                        status : 401, 
                        message: req.t('security.invalid_token')
                    });
                    const user = new User(UserQuery[0]);
                    req.User = user;
                    if (await user.IsTokenInvalid((decoded as JwtPayload).tokenIdentifier))return res.status(401).json({
                        name   : req.t('name'), 
                        status : 401, 
                        message: req.t('security.invalid_token')
                    });
                    res.setHeader('Authorization', "Bearer " + token);
                    next();
                } catch(error) {
                    console.log(error)
                    return res.status(500).json({
                        name   : req.t('name'), 
                        status : 500, 
                        message: req.t('route.error.500')
                    });
                }
            }
        });
    } else {
        return res.status(401).json({
            name   : req.t('name'), 
            status : 401, 
            message: req.t('security.token_required')
        });
    }
}

export function requirePermissionLevel (requiredPermissionLevel: number) {
    return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        let userPermissionLevel = req.User.GetPermissionLevel();
        if (userPermissionLevel >= requiredPermissionLevel) {
            return next();
        } else {
            return res.status(500).json({
                name   : req.t('name'), 
                status : 500, 
                message: req.t('security.access_denied')
            });
        }
    };
}