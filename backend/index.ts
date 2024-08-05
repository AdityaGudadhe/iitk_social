import express from "express";

const app = express();
app.use(express.json());

app.get("/", (req: express.Request, res: express.Response) => {
    res.send("Hello");
})

app.listen(3000);