import express from "express";
import {Session} from "neo4j-driver";
import {cloudinary} from "../config/cloudinary";
import fs from "fs";
import multer from "multer";
import path from "path";
import {v4 as uuidv4} from "uuid";

export async function verifyPostExist(postId: string, res: express.Response, session: Session): Promise<void> {
    try{
        const doesExists = await session.run('MATCH (post: Posts {postId: $postId})' +
            'RETURN post', { postId });
        if(doesExists.records.length===0){
            throw new Error("Post with postId doesnt exist");
        }
    }
    catch (err){
        console.log(err);
        res.status(401).json({message: "Post with postId doesnt exist"});
    }
}

const storage = multer.diskStorage({
    destination: (req:express.Request, file, callback)=>{
        const uploadPath: string = path.join(__dirname, "./uploads/")
        callback(null, uploadPath);
    },

    filename: (req:express.Request, file, callback)=>{
        const sanitizedFilename:string = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const uniqueSuffix:string = Date.now().toString() + '-' + Math.round(Math.random() * 1e9).toString();
        callback(null, file.fieldname + '-' + uniqueSuffix + path.extname(sanitizedFilename));
    }
})


export const upload = multer({storage});

export async function createUploads(req: express.Request, res: express.Response){
    const files: Express.Multer.File[] | {[p: string]: Express.Multer.File[]} | undefined = req.files;
    const uploadResults: string[] = [];
    try{
        if (files) {
            if (Array.isArray(files)) {
                for (const file of files) {
                    const filePath = file.path;
                    console.log(filePath);
                    const result = await cloudinary.uploader.upload(filePath,
                        {
                            resource_type: "auto"
                        }
                    )

                    uploadResults.push(result.url);
                    fs.unlinkSync(filePath);
                }
            } else if (files && typeof files === 'object') {
                for (const key in files) {
                    if (files.hasOwnProperty(key) && Array.isArray(files[key])) {
                        for (const file of files[key]) {
                            const filePath = file.path;
                            console.log(filePath);
                            const result = await cloudinary.uploader.upload(filePath,
                                {
                                    resource_type: "auto"
                                }
                            )

                            uploadResults.push(result.url);
                            fs.unlinkSync(filePath);
                        }
                    }
                }
            }
        }
    }
    catch(error){
        console.log(error);
        res.json({message:"Error uploading", error});
    }
    return uploadResults;
}

export function makeUniqueString(){
    return Date.now().toString() + uuidv4() + Math.round(Math.random()*1e9).toString();
}

