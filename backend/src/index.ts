import express from "express";
import userRouter from "./routes/user";
import cookieParser from "cookie-parser";
import updateRouter from "./routes/update";
import postsRouter from "./routes/posts";
import dotenv from 'dotenv';
import communityRouter from "./routes/community";
dotenv.config();

const JWT_SECRET: string = process.env.JWT_SECRET || "default_jwt_secret";

const app = express();
app.use(cookieParser());

app.use(express.json());
app.use("/user", userRouter);
app.use("/update", updateRouter);
app.use("/post", postsRouter);
app.use("/community", communityRouter);

app.get("/", (req: express.Request, res: express.Response) => {
    res.send("Hello");
})
console.log("listening on port 3000");
app.listen(3000);