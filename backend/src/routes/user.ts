import express from "express";
import driver from "../db/init";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import dotenv from 'dotenv';
import {defaultDpUrl} from "../config/cloudinary";
dotenv.config();


// const JWT_SECRET: string = process.env.JWT_SECRET || "default_jwt_secret";
const JWT_SECRET="Chandukechachanechandukichachikochandikechammachsechatnichatayi";

const app = express();
app.use(express.json());
app.use(cookieParser());
const userRouter = express.Router();

interface finalProfilePayloadType{
    posts: object[],
    comments: object[],
    likes: object[]
}

interface InitialSignupRequestType {
    userId: string,
    name: string,
    email: string,
}

userRouter.post("/signin", async (req: express.Request, res: express.Response) => {
    const userBody:InitialSignupRequestType = req.body;
    const session = driver.session();
    const userId:string = userBody.userId;

    try{
        const userExists = await session.run('MATCH (user:User {userId: $userId}) RETURN (user)',
            {userId}
        )
        if(userExists.records.length===0){
            const user = await session.run('CREATE(user:User { ' +
                'userId: $userId, ' +
                'name: $name, ' +
                'email: $email,' +
                'dpUrl: $dpUrl,' +
                'joinDate: date(),' +
                'created: datetime(),' +
                'bio: "",' +
                'location: "",' +
                'followerCount: 0,' +
                'followingCount: 0})' +
                'RETURN user',
                {userBody, dpUrl : defaultDpUrl})
            const token:string = jwt.sign(user.records[0].get('user').properties, JWT_SECRET);
            res.cookie('user', token);
            res.status(200).json({message: "user created" , user: user.records[0].get('user').properties});
        }
        else{
            const token:string = jwt.sign(userExists.records[0].get('user').properties, JWT_SECRET);
            res.cookie('user', token);
            res.status(200).json({message: "user already existed", user: userExists.records[0].get("user").properties});
        }
    }
    catch(err){
        console.log(err);
        res.status(411).json({
            err
        })
    }
    finally {
        await session.close();
    }
})

userRouter.put("/like/:postId", async(req: express.Request, res: express.Response) => {
    const session = driver.session();
    const postId:string = req.params.postId;
    try{
        const decodedCookie = jwt.verify(req.cookies.user, JWT_SECRET);
        //@ts-ignore
        const userId:string = decodedCookie.userId;

        try{
            const doesExists = await session.run('MATCH (post: Posts {postId: $postId})' +
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

userRouter.put("/follow/:userId", async(req: express.Request, res: express.Response) => {
    const session = driver.session();
    const userId:string = req.params.userId;
    try{
        const decodedCookie = jwt.verify(req.cookies.user, JWT_SECRET);
        //@ts-ignore
        const authorId:string = decodedCookie.userId;

        try{
            const checkQuery:string = 'MATCH (author:User {userId:$authorId})-[r:FOLLOWS]->(user:User {userId: $userId})' +
                'RETURN r';

            const addQuery: string = 'MATCH (author:User {userId: $authorId})' +
            'MATCH (user:User {userId: $userId})' +
            'MERGE (author)-[r:FOLLOWS]->(user)' +
            'SET user.followerCount = user.followerCount + 1,' +
            'author.followingCount = author.followingCount + 1';

            const deleteQuery:string = 'MATCH (author:User {userId: $authorId})' +
           'MATCH (user:User {userId: $userId})' +
           'MATCH (author)-[r:FOLLOWS]->(user)' + 'SET user.followerCount = user.followerCount - 1,' +
                'author.followingCount = author.followingCount - 1 ' +
                'DELETE r';

            const isFollowed = await session.run(checkQuery, {authorId, userId});


            if(isFollowed.records.length > 0){
                try{
                   await session.run(deleteQuery, {authorId, userId});
                    res.status(200).json({message:"follow removed"});
                }
                catch(e){
                    console.log(e);
                    res.status(411).json({message:"error while removing follow", e});
                }
            }
            else{
                try{
                    await session.run(addQuery, {authorId, userId});
                    res.status(200).json({message:"User followed"});
                }
                catch(e){
                    console.log(e);
                    res.status(411).json({message:"error while adding follow", e});
                }
            }
        }
        catch(e){
            console.log(e);
            res.status(411).json({message:"error while checking follow", e});
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

userRouter.get("/:userId", async (req: express.Request, res: express.Response)=>{
    const session = driver.session();
    const userId:string = req.params.userId;

    try{

        const userInfo = await session.run('MATCH (user:User {userId: $userId})-[posted:POSTED]->(post)' +
            'MATCH (user)-[commented:COMMENTED]->(comment)' +
            'MATCH (comment)-[:PARENT]->(parent)' +
            'MATCH (user)-[liked:LIKED]->(likePost)' +
            'RETURN {' +
            'user: user,' +
            'authoredPosts: collect(post),' +
            'commentInfo: collect({comment: comment, parent: parent}),' +
            'likedPosts: collect(likePost)' +
            '} AS userInfo', {userId});

        const finalPayload = userInfo.records[0].get('authoredPosts').properties;
        res.status(200).json({finalPayload});
    }
    catch(error){
        console.log(error);
        res.status(411).json({message:"Error getting profile information", error});
    }
    finally{
        await session.close();
    }
})


export default userRouter;