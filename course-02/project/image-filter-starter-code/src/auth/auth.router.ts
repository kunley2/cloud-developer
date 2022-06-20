import * as jwt from 'jsonwebtoken';
import {Response, Request, Router} from 'express';
import { NextFunction } from 'connect';
import {config} from '../config/config'


const router: Router = Router();

function generateJwt(userMail){
    return jwt.sign(userMail.json(),config.jwt.secret,(err)=>{
        console.log(err)
    })
}

export function requireAuth(req:Request, res:Response, next:NextFunction) {
    
    
    if (!req.headers || !req.headers.authorization){
        return res.status(401).send('you do not have authorization headers')
    }
    const token_bearer = req.headers.authorization.split(' ');
    if (token_bearer.length !=2){
        return res.status(401).send('malformed token');
    }
    const token = token_bearer[1];
    console.log(token)
    return jwt.verify(token, config.jwt.secret,(err,decoded)=>{
        console.log('decoded: ' + decoded)
        if (err) {
            console.log(err.message)
           
            return res.status(500).send({auth:false, message: 'not authorized to view'});
        }

        return next();
    });

}

router.post('/login',async (req:Request, res:Response)=> {
    let email: string =req.body.email;
    let password: string = req.body.password;
    if (!email || !password) {
        return res.status(401).send('please put an email and a password');
    } 
    const jwt_token = generateJwt(email);
    return res.status(200).send({auth:true, token:jwt_token})
})

router.get('/me',
requireAuth,
async (req,res)=>{
    return res.status(200).send({ auth: true, message: 'Authenticated.' });
})

export const authRouter:Router = router;


