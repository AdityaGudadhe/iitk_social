import express from "express";
import driver from "../db/init";

const app = express();
app.use(express.json());
const userRouter = express.Router();

interface InitialSignupRequestType {
    userId: string,
    name: string,
    email: string,
    dpUrl: string,
}
userRouter.post("/", async (req: express.Request, res: express.Response) => {
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
                'created: datetime()})',
                userBody)
            res.status(200).json({message: "user created", user: user.records[0]});
        }
        else{
            res.status(200).json({message: "user already existed", user: userExists.records[0]});
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

userRouter.put("/login", (req: express.Request, res: express.Response) => {})

export default userRouter;