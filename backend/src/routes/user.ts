import express from "express";
import driver from "../db/init";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";


const JWT_SECRET = "";

const app = express();
app.use(express.json());
app.use(cookieParser());
const userRouter = express.Router();



interface InitialSignupRequestType {
    userId: string,
    name: string,
    email: string,
    dpUrl: string,
}
userRouter.post("/signin", async (req: express.Request, res: express.Response) => {
    const userBody:InitialSignupRequestType = req.body;
    const session = driver.session();
    const userId:string = userBody.userId;


    try{
        const userExists = await session.run('MATCH (user:User {userId: $userId}) RETURN (user)', {
            userId
        })
        if(userExists.records.length==0){
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
                'followingCount: 0})',
                userBody)
            const token:string = jwt.sign(user.records[0].get('user').properties, JWT_SECRET);
            res.cookie('user', token);
            res.status(200).json({message: "user created", user: user.records[0].get('user').properties});
        }
        else{
            const token:string = jwt.sign(userExists.records[0].get('user').properties, JWT_SECRET);
            res.cookie('user', token);
            res.status(200).json({message: "user already existed", user: userExists.records[0].get('user').properties});
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

// userRouter.put("/update", async (req: express.Request, res: express.Response) => {
//     // const session = driver.session();
//     const cookie = req.cookies;
//     try{
//         const decodedCookie = jwt.verify(cookie.user, JWT_SECRET);
//         res.send(decodedCookie);
//
//     }
//     catch (e){
//         res.status(411).json({
//             e,
//             message: "wrong cookie"
//         })
//     }
// })

export default userRouter;