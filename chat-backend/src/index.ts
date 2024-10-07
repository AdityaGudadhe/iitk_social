import express from "express";
import {Server} from "socket.io";
import { createServer } from "http";
import {contactMessagesType, Message, dbMessageSchema} from "./commons/types";
import {getContactsFromLL, getContactsLL, getMessages, sendMessage} from "./utils";
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors : {
        origin : "*",
        allowedHeaders : "Authorization",
        methods : ["GET", "POST"],
        credentials : true
    }
});


io.on("connection", async (socket)=>{
    const {userid, recipientId} = socket.request.headers;
    console.log(`User: ${userid} connected with user: ${recipientId}`);
    const userId = typeof(userid)=="string" ? userid : "";
    socket.join(userId);

    //TODO : put the retrieve message logic here
    const contactsLL = await getContactsLL(userId);
    const contacts = getContactsFromLL(contactsLL, 10) || [];
    const messages = await getMessages(contacts, userId);

    socket.emit("initial_messages", messages);

    socket.on("message", async (m:Message)=>{
        const {recipientId} = m;
        const room = io.sockets.adapter.rooms.get(recipientId);
        const isRecipientOnline = (room && room.size > 0) || false;

        await sendMessage(io, m, isRecipientOnline);

    })
})


app.use(express.json());
app.get('/', async (req: express.Request, res: express.Response) => {
    res.send("Hello World");
});

httpServer.listen(3050);