import express from "express";
import driver from "../db/init";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret";

export async function postPermissionCheck(req: express.Request, res: express.Response, next:express.NextFunction){
    const session = driver.session();
    const reqBody = req.body.text;
    const { communityId } = JSON.parse(reqBody);
    try{
        const decodedCookie = jwt.verify(req.cookies.user, JWT_SECRET);
        //@ts-ignore
        const userId:string = decodedCookie.userId;

        try{
            const checkQueryResult = await session.run('MATCH (community:Community {communityId: $communityId})' +
                'MATCH (user:User {userId: $userId})' +
                'OPTIONAL MATCH (community)-[r:ADMIN]->(user)' +
                'RETURN CASE ' +
                '   WHEN r IS NOT NULL THEN true' +
                '   WHEN community.permission = false THEN true' +
                '   ELSE false' +
                'END as result', {communityId, userId});

            const check: boolean = checkQueryResult.records[0].get('result');
            console.log(check);
            if(check) next();
            res.status(411).json({message: "not allowed bro, you are not allowed"});
        }
        catch(e){
            console.log(e);
            res.status(411).json({message: "error in querying database"});
        }
    }
    catch (e){
        console.log(e);
        res.status(411).json({message: "jwt sudhar apna"});
    }
}