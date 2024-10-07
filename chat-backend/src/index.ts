import express from "express";
import {Server} from "socket.io";
import { createServer } from "http";
import { v7 } from "uuid";
import { db } from "./firestore-config";
import { collection, doc, getDoc, runTransaction } from "firebase/firestore";

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

function makeLL(){
    const next = new Map();
    const prev = new Map();

    next.set('head', 'tail');
    prev.set('tail', 'head');

    return {next, prev};
}


function updateLL(next:any, prev:any, recipientId : string){
    if(next.get(recipientId)!==undefined){
        const prevElement = prev.get(recipientId);
        const nextElement = next.get(recipientId);

        next.set(prevElement, nextElement);
        prev.set(nextElement, prevElement);
    }
    const currHead = next.get('head');
    next.set('head', recipientId);
    prev.set(recipientId, 'head');
    next.set(recipientId, currHead);
    prev.set(currHead, recipientId);
}


function getRoomId(userId1 : string , userId2 : string ){
    let temp = [userId1, userId2];
    temp.sort();
    return temp[0] + "#" + temp[1];
}



async function insertDbMessage({roomId, recipientId, senderId, message, messageId, status} : dbMessageSchema){
    const payload = {
        messageId, recipientId, senderId, message, status, timestamp : new Date()
    }
    try{
        await runTransaction(db, async (transaction)=>{
            const roomRef = doc(db, "Room", roomId);
            const messageCollection = collection(roomRef,"Messages");
            const documentRef = doc(messageCollection, messageId);
            transaction.set(documentRef, payload);

            const userRef = doc(db, "User", senderId);
            const response = await transaction.get(userRef);
            let next, prev;
            if(response.data()?.next || response.data()?.prev){
                const LL  = makeLL();
                next = LL.next; prev = LL.prev;
            }
            else{
                next = response.data()?.next;
                prev = response.data()?.prev;
            }
            updateLL(next, prev, recipientId);
            transaction.update(userRef, {next, prev});
        })
    }
    catch (e) {
        console.log(e);
    }
}


async function sendMessage(io:any, m : Message, status : boolean){
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
        await insertDbMessage(payload);
    }
    catch(e){
        console.log(e);
    }
}


io.on("connection", async (socket)=>{
    const docRef = doc(db, "Contacts", "1");
    const response = await getDoc(docRef);
    if(response.data()!==undefined) {
        //@ts-ignore
        console.log(response.data().next);
    }
    const {userid, recipientId} = socket.request.headers;
    console.log(`User: ${userid} connected with user: ${recipientId} `);
    //@ts-ignore
    socket.join(userid);

    //TODO : put the retrieve message logic here



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