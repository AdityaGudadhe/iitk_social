import {v2 as cloudinary} from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();


cloudinary.config({
    cloud_name: 'ddw7tsdob',
    api_key: '647628561811582',
    api_secret: '8U3gjzuNJUipoldprKiUDleI7dI'
});

const defaulDpUrl:string = "";

export {cloudinary, defaulDpUrl};