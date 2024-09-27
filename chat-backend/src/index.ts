import express from "express";

const app = express();

app.use(express.json());


app.get('/', (req: express.Request, res: express.Response) => {
    res.send("Hello World!");
});

app.listen(3001);