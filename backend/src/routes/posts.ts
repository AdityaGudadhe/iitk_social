import express from "express";
import driver from "../db/init";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import {makeUniqueString, upload} from "../utils/utils";
import { createUploads } from "../utils/utils";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
const postsRouter = express.Router();

const JWT_SECRET: string = process.env.JWT_SECRET || "default_jwt_secret";


interface postsInputType{
    groupId: string | null,
    parentId: string | null,
    body: string,
}

interface postsEditType{
    body: string,
}

postsRouter.post("/", upload.array('files', 10), async (req: express.Request, res: express.Response) => {
    const session = driver.session();
    const body = req.body.text;
    const postBody = JSON.parse(body);
    const uploadResults: string[]= await createUploads(req, res);
    const fileContentInfo:string[] | null = uploadResults.length===0? null : uploadResults;

    try{
        const decodedCookie = jwt.verify(req.cookies.user, JWT_SECRET);
        //@ts-ignore
        const userId:string = decodedCookie.userId;

        try{
            const postId:string = "post_" + makeUniqueString();
            const post = await session.run('CREATE(post:Posts {' +
                'postId: $postId,' +
                'groupId: $groupId,' +
                'parentId: $parentId,' +
                'body: $body,' +
                'fileContentInfo: $fileContentInfo,' +
                'joinDate: date(),' +
                'created: datetime(),' +
                'likeCount: 0,' +
                'commentCount: 0})' +
                'RETURN post', {
                postId,
                groupId: postBody.groupId || null,
                parentId: postBody.parentId || null,
                body: postBody.body,
                 fileContentInfo});

            const parentId:string | null = postBody.parentId;
            if(parentId){
                await session.run('MATCH (parent:Posts {postId: $parentId})' +
                    'MATCH (comment: Posts {postId: $postId})' +
                    'MERGE (comment)-[p:PARENT]->(parent)' +
                    'MERGE (parent)-[c:COMMENT]->(comment)' +
                    'SET p.time = datetime(),' +
                    'c.time = datetime(),' +
                    'parent.commentCount = parent.commentCount + 1', {parentId, postId})

                await session.run('MATCH (user: User {userId: $userId})' +
                    'MATCH (post: Posts {postId: $postId})' +
                    'MERGE (user)-[r:COMMENTED]->(post)' +
                    'SET r.time = datetime()', { userId, postId } );
            }
            else{
                await session.run('MATCH (user: User {userId: $userId})' +
                    'MATCH (post: Posts {postId: $postId})' +
                    'MERGE (user)-[r:POSTED]->(post)' +
                    'SET r.time = datetime()', {userId, postId});
            }

            res.status(200).json({message: "post created", user: post.records[0].get('post').properties});
        }
        catch(error){
            console.log(error)
            res.status(411).json(error);
        }
    }
    catch(error){
        console.log(error);
        res.status(411).json({message:"JWT not valid"});
    }
    finally {
        await session.close();
    }
})


postsRouter.put("/edit/content/:postId", async (req: express.Request, res: express.Response) => {
    const session = driver.session();
    const postId:string = req.params.postId;
    const postBody:postsEditType = req.body.body;

    try{
        const post = await session.run('MATCH(post:Posts { postId: $postId })'+
            'SET post.body = $body RETURN post', {postId, body: postBody});

        res.status(200).json({message: "post updated", user: post.records[0].get('post').properties});
    }
    catch(error){
        console.log(error)
        res.status(411).json({message: "Error updating database or invalid postId", error});
    }
    finally {
        await session.close();
    }
})

postsRouter.put("/edit/images/add/:postId", upload.array('files', 10), async (req: express.Request, res: express.Response) => {
    const session = driver.session();
    const postId:string = req.params.postId;
    const uploadResults: string[]= await createUploads(req, res);
    const fileContentInfo:string[] | null = uploadResults.length===0? null : uploadResults;

    try{
        const post = await session.run('MATCH(post:Posts { postId: $postId })'+
            'SET post.fileContentInfo = COALESCE(post.fileContentInfo,[]) + $fileContentInfo ' +
            'RETURN post', {postId, fileContentInfo});

        res.status(200).json({message: "post updated", user: post.records[0].get('post').properties});
    }
    catch(error){
        console.log(error)
        res.status(411).json({message: "Error updating database or invalid postId", error});
    }
    finally {
        await session.close();
    }
})

interface fileContentInfoToDeleteType {
    fileContentInfoToDelete: object[]
}

// postsRouter.put("/edit/images/delete/:postId", async (req: express.Request, res: express.Response) => {
//     const session = driver.session();
//     const postId:string = req.params.postId;
//     const { fileContentInfoToDelete }  = req.body;
//     try{
//         const post = await session.run('MATCH(post:Posts { postId: $postId })'+
//             'SET post.fileContentInfo += fileContentInfo' +
//             'RETURN post', {postId, fileContentInfo});
//
//         res.status(200).json({message: "post updated", user: post.records[0].get('post').properties});
//     }
//     catch(error){
//         console.log(error)
//         res.status(411).json({message: "Error updating database or invalid postId", error});
//     }
//     finally {
//         await session.close();
//     }
// })

postsRouter.get("/:postId", async (req:express.Request, res: express.Response)=>{
    const session = driver.session();
    const postId:string = req.params.postId;
    try{
        const postInfo = await session.run('MATCH (post:Posts {postId:$postId})' +
            'MATCH (post)-[c:COMMENT]->(comment)' +
            'RETURN { post: post,' +
            'comments: collect(comment) } as postInfo', {postId});

        res.status(200).json(postInfo.records[0].get('postInfo').properties);
    }
    catch (error){
        console.log(error);
        res.status(411).json({message:"error getting posts"});
    }
    finally{
        await session.close();
    }
})
export default postsRouter;