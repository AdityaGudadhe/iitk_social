import express from "express";
import driver from "../db/init";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import dotenv from 'dotenv';
import multer from "multer";
import path from "path";
import {cloudinary, defaulDpUrl} from "../config/cloudinary";
import fs from "fs";
dotenv.config();

const JWT_SECRET: string = process.env.JWT_SECRET || "default_jwt_secret";

const app = express();
app.use(express.json());
app.use(cookieParser());
const updateRouter = express.Router();

interface updateInfoType{
    infoType: "bio" | "name" | "location",
    info: string
}

const storage = multer.diskStorage({
    destination: (req:express.Request, file, callback)=>{
        callback(null, "./uploads/");
    },

    filename: (req:express.Request, file, callback)=>{
        const sanitizedFilename:string = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const uniqueSuffix:string = Date.now().toString() + '-' + Math.round(Math.random() * 1e9).toString();
        callback(null, file.fieldname + '-' + 'profile-pic' + uniqueSuffix + path.extname(sanitizedFilename));
    }
})

const upload = multer({storage});

updateRouter.put("/", async (req: express.Request, res: express.Response) => {
    const session = driver.session();
    const body:updateInfoType = req.body;
    const { info, infoType} = body;
    try{
        const decodedCookie = jwt.verify(req.cookies.user, JWT_SECRET);
        //@ts-ignore
        const userId = decodedCookie.userId;
        try{
            const updateInfo = await session.run('MATCH (user:User {userId: $userId})' +
                `SET user.${infoType} = $info` +
                'RETURN user',
                {userId, info});

            const token:string = jwt.sign(updateInfo.records[0].get('user').properties, JWT_SECRET);
            res.cookie('user', token);
            res.status(200).json({message: "bio updated successfully.", user: updateInfo.records[0].get('user').properties});
        }
        catch (e){
            res.status(411).json(e);
        }
    }
    catch (e){
        res.status(411).json(e);
    }
    finally {
        await session.close();
    }
})

updateRouter.put("/dpurl", upload.single('files'), async (req: express.Request, res: express.Response) => {
    const session = driver.session();
    let newDpUrl:string = defaulDpUrl;
    if(req.file){
        const filePath = req.file.path;
        const result = await cloudinary.uploader.upload(filePath, {
            format: "auto",
            resource_type: "auto"
        })
        newDpUrl = result.url;
        fs.unlinkSync(filePath);
    }
    try{
        const decodedCookie = jwt.verify(req.cookies.user, JWT_SECRET);
        //@ts-ignore
        const userId = decodedCookie.userId;
        try{
            const updateInfo = await session.run('MATCH (user:User {userId: $userId})' +
                'SET user.dpUrl = $newDpUrl' +
                'RETURN user',
                {userId, newDpUrl});

            const token:string = jwt.sign(updateInfo.records[0].get('user').properties, JWT_SECRET);
            res.cookie('user', token);
            res.status(200).json({message: "bio updated successfully.", user: updateInfo.records[0].get('user').properties});
        }
        catch (e){
            res.status(411).json(e);
        }
    }
    catch (e){
        res.status(411).json(e);
    }
    finally {
        await session.close();
    }
})

export default updateRouter;