export interface Message{
    senderId : string,
    recipientId : string,
    message : string
}

export interface dbMessageSchema{
    messageId : string,
    senderId : string,
    recipientId : string,
    message : string,
    status : boolean,
    roomId : string
}

export interface contactMessagesType{
    [contactId: string]: object[]
}
