import {collection, doc, getDocs, limit, orderBy, query, runTransaction, where} from "firebase/firestore";
import {db} from "./firestore-config";
import {v7} from "uuid";
import {contactMessagesType, Message, dbMessageSchema} from "./commons/types";


export function makeLL(){
    const next = new Map();
    const prev = new Map();

    next.set('head', 'tail');
    prev.set('tail', 'head');

    return {next, prev};
}


export function updateLL(next:any, prev:any, recipientId : string){
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


export function getContactsFromLL(next : any, limit : number){
    if(next==undefined) {
        return null;
    }
    let currElement = next.get('head');
    let contacts:string[] = [];
    while(currElement != 'tail' && limit>=0){
        contacts.push(currElement);
        currElement = next.get(currElement);
        --limit;
    }
    return contacts;
}

export async function getContactMessages(roomId : string, q : any){
    const messages:object[] = [];
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        //@ts-ignore
        messages.push(doc.data());
    });

    return messages;
}


export async function getMessages(contacts : string[], userId : string){
    const n = contacts.length;
    let unseenMessages:contactMessagesType = {}; let seenMessages:contactMessagesType = {};
    for(let i=0;i<n;i++){
        const contactId = contacts[i];
        const roomId = getRoomId(userId, contactId);


        const docRef = collection(db, "Rooms", roomId);
        const query1 = query(docRef, where('status', '==', 'false'), orderBy('messageId'));

        const unseenContactMessages = await getContactMessages(roomId, query1);
        unseenMessages.contactId = unseenContactMessages;
        //@ts-ignore
        const firstUnseenMessage : string = unseenContactMessages[0].messageId;


        const query2 = query(docRef, where('messageId', '<', firstUnseenMessage), orderBy('messageId'), limit(50));
        seenMessages.contactId = await getContactMessages(roomId, query2);
    }

    return {unseenMessages, seenMessages};
}

export function getRoomId(userId1 : string , userId2 : string ){
    let temp = [userId1, userId2];
    temp.sort();
    return temp[0] + "#" + temp[1];
}

export async function insertDbMessage({roomId, recipientId, senderId, message, messageId, status} : dbMessageSchema){
    const payload = {
        messageId, recipientId, senderId, message, status, timestamp : new Date()
    }
    try{
        await runTransaction(db, async (transaction)=>{
            const roomRef = doc(db, "Rooms", roomId);
            const messageCollection = collection(roomRef,"Messages");
            const documentRef = doc(messageCollection, messageId);
            transaction.set(documentRef, payload);

            const userRef = doc(db, "User", senderId);
            const response = await transaction.get(userRef);
            let next, prev;
            if(!response.data()){
                const LL  = makeLL();
                next = LL.next; prev = LL.prev;
                updateLL(next, prev, recipientId);
                transaction.set(userRef, {next, prev});
            }
            else{
                next = response.data()?.next;
                prev = response.data()?.prev;
                updateLL(next, prev, recipientId);
                transaction.update(userRef, {next, prev});
            }
            const userRef2 = doc(db, "User", recipientId);
            const response2 = await transaction.get(userRef2);
            let next2, prev2;
            if(!response2.data()){
                const LL  = makeLL();
                next2 = LL.next; prev2 = LL.prev;
                updateLL(next2, prev2, recipientId);
                transaction.set(userRef2, {next2, prev2});
            }
            else{
                next2 = response2.data()?.next;
                prev2 = response2.data()?.prev;
                updateLL(next2, prev2, recipientId);
                transaction.update(userRef2, {next2, prev2});
            }
        })
    }
    catch (e) {
        console.log(e);
    }
}


export async function sendMessage(io:any, m : Message, status : boolean){
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

export async function getContactsLL(userId : string){
    const docCollection = collection(db, "Contacts", userId) ;
    const querySnapshot = await getDocs(docCollection);
    const data = querySnapshot.docs[0].data();
    if(data===undefined){
        return undefined;
    }
    return data.next;
}
