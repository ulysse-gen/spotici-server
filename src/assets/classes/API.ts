//API Class
import cors from 'cors';
import express from 'express';
import i18next from "i18next";
import i18nextMiddleware from "i18next-http-middleware";

import APIRoutesV1 from '../API/v1/routes/index';

export default class API {
    private app: express.Application;
    private port: Number;
    public secret: string;
    constructor() {
        this.app = express();

        this.port = 3000;
        this.secret = process.env.API_SECRET || 'RFtv6@U3Tofpw8KnYMieiP2gw4X7.HcHC-7btc66b4ZiiHm_R@ibWZkYiDE8Y@yLo*ePH';
    }

    Start() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: false }));

        i18next.use(i18nextMiddleware.LanguageDetector).init({
            preload: ['EN', 'FR'],
            fallbackLng: "en",
            ns: ["API"]
        })


        this.app.use(
            i18nextMiddleware.handle(i18next, {
              removeLngFromUrl: true // removes the language from the url when language detected in path
            })
          )

        this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => { //Add the API to the request object to be fetched on controllers
            req.i18n.changeLanguage(req.language);
            req.API = this;
            next();
        });

        this.app.use('/v1', APIRoutesV1); //Use the routes from the v1 API on /v1

        this.app.use(function(req, res, next) {
            res.status(404).json({name: req.t('name'), status: 404, message: req.t('route.unknown')});
        });   

        this.app.listen(this.port, () => {
            console.log(`API listening on ${this.port}.`);
        });
        return this;
    }
}