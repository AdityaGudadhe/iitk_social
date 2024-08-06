import express from "express";
import userRouter from "./routes/user";
const app = express();


app.use(express.json());
app.use("/signin", userRouter);


app.get("/", (req: express.Request, res: express.Response) => {
    res.send("Hello");
})
console.log("listening on port 3000");
app.listen(3000);