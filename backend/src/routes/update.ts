import express from "express";
import driver from "../db/init";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import dotenv from 'dotenv';
import {upload} from "../utils/utils"
import {cloudinary, defaultDpUrl} from "../config/cloudinary";
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
interface commInitialInputBodyType{
    name: string,
    bio: string | null
}
type commPostPermissionsType = "anyone" | "admin-only";

updateRouter.put("/user/content", async (req: express.Request, res: express.Response) => {
    const session = driver.session();
    const body:updateInfoType = req.body;
    const { info, infoType} = body;
    console.log(infoType);
    try{
        const decodedCookie = jwt.verify(req.cookies.user, JWT_SECRET);
        //@ts-ignore
        const userId = decodedCookie.userId;
        try{
            const updateInfo = await session.run('MATCH (user:User {userId: $userId})' +
                `SET user.${infoType} = $info ` +
                'RETURN user',
                {userId, info});

            const token:string = jwt.sign(updateInfo.records[0].get('user').properties, JWT_SECRET);
            res.cookie('user', token);
            res.status(200).json({message: "bio updated successfully.", user: updateInfo.records[0].get('user').properties});
        }
        catch (e){
            console.log(e);
            res.status(411).json(e);
        }
    }
    catch (e){
        console.log(e);
        res.status(411).json(e);
    }
    finally {
        await session.close();
    }
})

updateRouter.put("/user/dpurl", upload.single('files'), async (req: express.Request, res: express.Response) => {
    const session = driver.session();
    let newDpUrl:string = defaultDpUrl;
    if(req.file){
        const filePath = req.file.path;
        const result = await cloudinary.uploader.upload(filePath, {
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
                'SET user.dpUrl = $newDpUrl ' +
                'RETURN user',
                {userId, newDpUrl});

            const token:string = jwt.sign(updateInfo.records[0].get('user').properties, JWT_SECRET);
            res.cookie('user', token);
            res.status(200).json({message: "dp updated successfully.", user: updateInfo.records[0].get('user').properties});
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

updateRouter.put('/community/dpUrl/:communityId', upload.single('files'), async (req: express.Request, res: express.Response)=>{
    const session = driver.session();
    const communityId: string = req.params.groupId;
    let newDpUrl:string = defaultDpUrl;
    if(req.file){
        const filePath = req.file.path;
        const result = await cloudinary.uploader.upload(filePath, {
            resource_type: "auto"
        })
        newDpUrl = result.url;
        fs.unlinkSync(filePath);
    }

    try{
        const updatedProfile = await session.run('MATCH (comm: Community {communityId: $communityId})' +
            'SET comm.dpUrl = $newDpUrl ' +
            'RETURN comm', {communityId, newDpUrl});

        res.status(200).json({message: "dp updated successfully.", user: updatedProfile.records[0].get('comm').properties});
    }
    catch(error){
        console.log(error);
        res.status(411).json({message: "error updating dp"});
    }
});
updateRouter.put('/community/content/:communityId', async (req: express.Request, res: express.Response) => {
    const session = driver.session();
    const content: commInitialInputBodyType = req.body;
    const communityId: string = req.body.communityId;
    try{
        const updateInfo = await session.run('MATCH (comm:Community {communityId: $communityId})' +
            'SET comm.name = $name,' +
            'comm.bio = $bio '+
            'RETURN comm',
            {communityId, content});

        res.status(200).json({message: "bio updated successfully.", user: updateInfo.records[0].get('comm').properties});
    }
    catch (e){
        console.log(e);
        res.status(411).json(e);
    }
    finally {
        await session.close();
    }
});

export default updateRouter;