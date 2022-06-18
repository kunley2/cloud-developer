import * as jwt from 'jsonwebtoken';
import {Response, Request, Router} from 'express';
import { NextFunction } from 'connect';
import {config} from '../config/config'


const router: Router = Router();

function generateJwt(){
    return jwt.sign({},config.jwt.secret,(err)=>{
        console.log(err)
    })
}

export function requireAuth(req:Request, res:Response, next:NextFunction) {
    const j_token = jwt.sign({user:'kunle'},config.jwt.secret,{expiresIn:'5m'},(err,decoded)=>{
        // console.log(err)
        res.send({token:j_token, user:decoded})
    })
    console.log(j_token)
    if (!req.headers || !req.headers.authorization){
        return res.status(401).send('you do not have authorization headers')
    }
    const token_bearer = req.headers.authorization.split(' ');
    
    if (token_bearer.length !=1){
        return res.status(401).send('malformed token');
    }
    let token = token_bearer[0];
    // console.log(token)
    return jwt.verify(token, config.jwt.secret,(err,decoded)=>{
        console.log('decoded: ' + decoded)
        if (err) {
            console.log(err.message)
           
            return res.status(500).send({auth:false, message: 'not authorized to view'});
        }

        return next();
    });

}


