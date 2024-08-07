import express from "express";
import driver from "../db/init";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";


const JWT_SECRET = "Chandu ke chacha ne chandu ki chachi ko chandi ke chammach se chatni chatayi";

const app = express();
app.use(express.json());
app.use(cookieParser());
const updateRouter = express.Router();

updateRouter.put("/bio", async (req: express.Request, res: express.Response) => {
    const session = driver.session();
    const newBio = req.body.bio;
    try{
        const decodedCookie = jwt.verify(req.cookies.user, JWT_SECRET);
        //@ts-ignore
        const userId = decodedCookie.userId;
        try{
            const updateInfo = await session.run('MATCH (user:User {userId: $userId})' +
                'SET user.bio = $newBio' +
                'RETURN user',
                userId, newBio);

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

updateRouter.put("/name", async (req: express.Request, res: express.Response) => {
    const session = driver.session();
    const newName = req.body.name;
    try{
        const decodedCookie = jwt.verify(req.cookies.user, JWT_SECRET);
        //@ts-ignore
        const userId = decodedCookie.userId;
        try{
            const updateInfo = await session.run('MATCH (user:User {userId: $userId})' +
                'SET user.name = $newName' +
                'RETURN user',
                userId, newName);

            const token:string = jwt.sign(updateInfo.records[0].get('user').properties, JWT_SECRET);
            res.cookie('user', token);
            res.status(200).json({message: "name updated successfully.", user: updateInfo.records[0].get('user').properties});
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

// updateRouter.put("/dpurl", async (req: express.Request, res: express.Response) => {
//     const session = driver.session();
//     const newBio = req.body.bio;
//     try{
//         const decodedCookie = jwt.verify(req.cookies.user, JWT_SECRET);
//         //@ts-ignore
//         const userId = decodedCookie.userId;
//         try{
//             const updateInfo = await session.run('MATCH (user:User {userId: $userId})' +
//                 'SET user.bio = $newBio' +
//                 'RETURN user',
//                 userId, newBio);
//
//             const token:string = jwt.sign(updateInfo.records[0].get('user').properties, JWT_SECRET);
//             res.cookie('user', token);
//             res.status(200).json({message: "bio updated successfully.", user: updateInfo.records[0].get('user').properties});
//         }
//         catch (e){
//             res.status(411).json(e);
//         }
//     }
//     catch (e){
//         res.status(411).json(e);
//     }
//     finally {
//         await session.close();
//     }
// })

updateRouter.put("/location", async (req: express.Request, res: express.Response) => {
    const session = driver.session();
    const newBio = req.body.bio;
    try{
        const decodedCookie = jwt.verify(req.cookies.user, JWT_SECRET);
        //@ts-ignore
        const userId = decodedCookie.userId;
        try{
            const updateInfo = await session.run('MATCH (user:User {userId: $userId})' +
                'SET user.bio = $newBio' +
                'RETURN user',
                userId, newBio);

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

updateRouter.put("/email", async (req: express.Request, res: express.Response) => {
    const session = driver.session();
    const newBio = req.body.bio;
    try{
        const decodedCookie = jwt.verify(req.cookies.user, JWT_SECRET);
        //@ts-ignore
        const userId = decodedCookie.userId;
        try{
            const updateInfo = await session.run('MATCH (user:User {userId: $userId})' +
                'SET user.bio = $newBio' +
                'RETURN user',
                userId, newBio);

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