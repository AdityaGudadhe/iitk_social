import express from "express";
import {Server} from "socket.io";
import {createServer} from "http";
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors : {
        origin : "*",
        methods : ["GET", "POST"],
        credentials : true
    }
});

interface Message{
    senderId : string,
    recipientId : string,
    message : string
}


io.on("connection", (socket)=>{
    // console.log("user connected");
    const {userId} = socket.handshake.query;
    console.log(userId);
    // socket.join(userId);

    socket.on("message", ({senderId, recipientId, message}:Message)=>{
        const room = io.sockets.adapter.rooms.get(recipientId);
        const isRecipientOnline = room && room.size > 0;

        if (isRecipientOnline) {
            io.to(recipientId).emit("message", {
                message,
                senderId,
            });
            console.log(`Message sent to user with ID ${recipientId}`);
        } else {
            console.log(`User with ID ${recipientId} is offline. Storing message for later.`);
        }
    })
})


app.use(express.json());
app.get('/', (req: express.Request, res: express.Response) => {
    res.send("Hello World!");
});

httpServer.listen(3050);