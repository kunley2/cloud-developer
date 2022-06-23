import * as jwt from 'jsonwebtoken';
import {Response, Request, Router} from 'express';
import { NextFunction } from 'connect';
import {config} from '../config/config'


const router: Router = Router();

function generateJwt(userName:string) {
    return jwt.sign({"user": userName},config.jwt.secret,
        {expiresIn: 900});
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
    let username: string =req.body.username;
    let password: string = req.body.password;
    // console.log(email)
    if (!username || !password) {
        return res.status(401).send('please put an email and a password');
    } 
    try{
        const jwt_token = await generateJwt(username);
        return res.status(200).send({auth:true, token:jwt_token});
    }catch (err){
        console.log(err)
    }
    
})

router.get('/me',
requireAuth,
async (req,res)=>{
    return res.status(200).send({ auth: true, message: 'Authenticated.' });
})

export const authRouter:Router = router;


