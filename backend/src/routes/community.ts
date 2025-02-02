import express, {Router} from "express";
import driver from "../db/init";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import dotenv from 'dotenv';
import {Session} from "neo4j-driver";
import { defaultCommunityDpUrl } from "../config/cloudinary";
import {createUploads, makeUniqueString, upload} from "../utils/utils";
import {postPermissionCheck} from "../middlewares/community";
import userRouter from "./user";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
const communityRouter: Router = express.Router();

const JWT_SECRET: string = process.env.JWT_SECRET || "default_jwt_secret";

communityRouter.use('/post', async (req:express.Request, res:express.Response, next)=>{
    await postPermissionCheck(req, res, next);
})

interface commInitialInputBodyType{
    name: string,
    bio: string | null
}

communityRouter.post("/new",  async(req: express.Request, res:express.Response)=>{
    const session: Session = driver.session();
    const body:commInitialInputBodyType = req.body;
    const commPermissions: boolean = false;
    try{
        const decodedCookie = jwt.verify(req.cookies.user, JWT_SECRET);
        //@ts-ignore
        const userId: string = decodedCookie.userId;

        try{
            const commId: string = "community_" + makeUniqueString();
            const newCommResult = await session.run('CREATE(comm: Community {' +
                'communityId: $commId,' +
                'name: $name,' +
                'bio: $bio,' +
                'dpUrl: $defaultCommunityDpUrl' +
                'permission: $commPermissions' +
                'joinDate: date(),' +
                'created: datetime(),' +
                'adminCount: 1,' +
                'followerCount: 1' +
                '}) ' +
                'MATCH (user: User {userId: $userId})' +
                'MERGE (comm)-[r:ADMIN]->(user) ' +
                'MERGE (user)-[f:FOLLOWS]->(comm) ' +
                'SET r.created = datetime(),' +
                'f.created = datetime(),' +
                'user.followingCount = user.followingCount + 1 ' +
                'RETURN comm', {commId, body, defaultCommunityDpUrl, commPermissions, userId});

                res.status(200).json({message: "community created successfully",
                    community: newCommResult.records[0].get('comm').properties});
        }
        catch(e){
            console.log(e);
            res.status(411).json("error creating community");
        }
    }
    catch(error){
        console.log(error);
        res.status(411).json({message: "jwt not valid"});
    }
})

communityRouter.post('/post', upload.array('files', 10), async (req: express.Request, res: express.Response) => {
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
                'body: $body,' +
                'fileContentInfo: $fileContentInfo,' +
                'joinDate: date(),' +
                'created: datetime(),' +
                'likeCount: 0,' +
                'commentCount: 0}) ' +
                'RETURN post', {
                postId, postBody,
                fileContentInfo});

            await session.run('MATCH (user: User {userId: $userId})' +
                'MATCH (post: Posts {postId: $postId})' +
                'MERGE (user)-[r:POSTED]->(post)' +
                'SET r.time = datetime()', {userId, postId});

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
});

communityRouter.put('/permissions/:communityId', async (req: express.Request, res: express.Response) => {
    const session = driver.session();
    const communityId:string = req.params.communityId;
    try{
        await session.run('MATCH (comm: Community {communityId: $communityId})' +
            'SET comm.permission = NOT comm.permission', { communityId });
        res.status(200).json("successful switch");
    }
    catch(e){
        console.log(e);
        res.status(411).json("not successful");
    }
});

communityRouter.put("/admin", async(req: express.Request, res: express.Response) => {
    const session = driver.session();
    const postId:string = req.params.postId;
    try{
        const decodedCookie = jwt.verify(req.cookies.user, JWT_SECRET);
        //@ts-ignore
        const userId:string = decodedCookie.userId;

        try{
            const doesExists = await session.run('MATCH (comm: Posts {postId: $postId})' +
                'RETURN post', { postId });
            if(doesExists.records.length===0){
                throw new Error("Post with postId doesnt exist");
            }
        }
        catch (err){
            console.log(err);
            res.status(401).json({message: "Post with postId doesnt exist"});
        }

        try{
            const checkQuery:string = 'MATCH (user:User {userId:$userId})-[r:LIKED]->(post:Posts {postId: $postId})' +
                'RETURN r';
            const addQuery: string = 'MATCH (user:User {userId: $userId})' +
                'MATCH (post:Posts {postId: $postId})' +
                'MERGE (user)-[like:LIKED]->(post)' +
                'SET like.time = datetime(),' +
                'post.likeCount = post.likeCount + 1 RETURN post';
            const deleteQuery:string = 'MATCH (user:User {userId:$userId})-[r:LIKED]->(post:Posts {postId: $postId})' +
                'SET post.likeCount = post.likeCount - 1 DELETE r';


            const isLiked = await session.run(checkQuery, {userId, postId});


            if(isLiked.records.length > 0){
                try{
                    await session.run(deleteQuery, {userId, postId});
                    res.status(200).json({message:"Like removed"});
                }
                catch(e){
                    console.log(e);
                    res.status(411).json({message:"error while removing like", e});
                }
            }
            else{
                try{
                    await session.run(addQuery, {userId, postId});
                    res.status(200).json({message:"Post liked"});
                }
                catch(e){
                    console.log(e);
                    res.status(411).json({message:"error while adding like", e});
                }
            }
        }
        catch(e){
            console.log(e);
            res.status(411).json({message:"error while checking like", e});
        }
    }
    catch(e){
        console.log(e);
        res.status(411).json({message:"invalid secret or token", e});
    }
    finally {
        await session.close();
    }
})


export default communityRouter;