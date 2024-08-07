import express from "express";
import driver from "../db/init";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = "Chandu ke chacha ne chandu ki chachi ko chandi ke chammach se chatni chatayi";

const app = express();
app.use(express.json());
app.use(cookieParser());
const postsRouter = express.Router();

interface postsInputType{
    groupId: string | null,
    parentId: string | null,
    body: string,
    contentUrl: string[],
}

interface postsEditType{
    body: string,
    contentUrl: string[],
}

postsRouter.post("/", async (req: express.Request, res: express.Response) => {
    const session = driver.session();
    const postBody:postsInputType = req.body;
    try{
        const decodedCookie = jwt.verify(req.cookies.user, JWT_SECRET);
        //@ts-ignore
        const userId:string = decodedCookie.userId;

        try{
            const postId:string = uuidv4();
            const post = await session.run('CREATE(post:Posts {' +
                'postId: $postId' +
                'groupId: $groupId,' +
                'parentId: $parentId,' +
                'body: $body,' +
                'contentUrl: $contentUrl,' +
                'joinDate: date(),' +
                'created: datetime(),' +
                'likeCount: 0,' +
                'commentCount: 0})', {postId, postBody});

            await session.run('MATCH (user: User {userId: $userId})' +
                'MATCH (post: Posts {postId: $postId})' +
                'MERGE (user)-[:POSTED]->(post)', { userId, postId } );

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


postsRouter.put("/edit/:postId", async (req: express.Request, res: express.Response) => {
    const session = driver.session();
    const postBody:postsEditType = req.body;
    const postId:string = req.params.postId;

    try{
        const post = await session.run('MATCH(post:Posts { postId: $postId })'+
            'SET post.body = $body' +
            'SET post.contentUrl = $contentUrl' +
            'RETURN post', {postId, postBody});

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

export default postsRouter;