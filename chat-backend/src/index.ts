import express from "express";
import {DefaultEventsMap, Server} from "socket.io";
import {createServer} from "http";
import AWS from "aws-sdk";
// import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
// import { QueryCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import {v7} from "uuid";
import { db } from "./aws-config";



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

interface Message{
    senderId : string,
    recipientId : string,
    message : string
}

interface dbMessageSchema{
    messageId : string,
    senderId : string,
    recipientId : string,
    message : string,
    status : boolean,
    roomId : string
}

function getRoomId(userId1 : string , userId2 : string ){
    let temp = [userId1, userId2];
    temp.sort();
    return temp[0] + "#" + temp[1];
}

function insertDbMessage({roomId, recipientId, senderId, message, messageId, status} : dbMessageSchema){
    const params = {
        TableName : "Messages",
        Item : {
            "roomId" : {
                S : roomId
            },
            "messageId" : {
                S : messageId
            },
            "message" : {
                S : message
            },
            "senderId" : {
                S : senderId
            },
            "recipientId" : {
                S : recipientId
            },
            "status" : {
                B: status
            }
        },
        ReturnValues : "ALL_NEW"
    }
    try{
        const response = db.putItem(params);
        console.log(response);
    }
    catch (e) {
        console.log(e);
    }
}

function sendMessage(io:any, m : Message, status : boolean){
    const {recipientId, senderId, message} = m;
    const messageId:string = v7();
    const roomId :string = getRoomId(recipientId, senderId);
    const payload : dbMessageSchema = {
        roomId, recipientId, senderId, message, messageId, status
    };
    try{
        io.to(recipientId).emit("receive_message", {
            message,
            senderId,
            recipientId
        });
        insertDbMessage(payload);
    }
    catch(e){
        console.log(e);
    }
}


io.on("connection", (socket)=>{
    const {userid, recipientId} = socket.request.headers;
    console.log(`User: ${userid} connected with user: ${recipientId} `);
    //@ts-ignore
    socket.join(userid);

    //TODO : put the retrieve message logic here



    socket.on("message", (m:Message)=>{
        const {recipientId} = m;
        const room = io.sockets.adapter.rooms.get(recipientId);
        const isRecipientOnline = (room && room.size > 0) || false;

        // TODO : only keep one function call if dont need the console log
        if (isRecipientOnline) {
            sendMessage(io, m, isRecipientOnline);
            console.log(`Message sent to user with ID ${recipientId}`);
        } else {
             sendMessage(io, m, isRecipientOnline);
            console.log(`User with ID ${recipientId} is offline. Storing message for later.`);
        }
    })
})


app.use(express.json());
app.get('/', (req: express.Request, res: express.Response) => {
    res.send("Hello World!");
});

httpServer.listen(3050);