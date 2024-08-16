import express from "express";
import {Session} from "neo4j-driver";
import {cloudinary} from "../config/cloudinary";
import fs from "fs";

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