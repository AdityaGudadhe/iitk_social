import {v2 as cloudinary} from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();


cloudinary.config({
    cloud_name: 'ddw7tsdob',
    api_key: '647628561811582',
    api_secret: '8U3gjzuNJUipoldprKiUDleI7dI'
});

const defaultDpUrl:string = "https://res.cloudinary.com/ddw7tsdob/image/upload/v1722766820/samples/ecommerce/car-interior-design.jpg";
const defaultCommunityDpUrl: string = "https://res.cloudinary.com/ddw7tsdob/image/upload/v1723800017/Gustave_Dore___An_Angel_Leading_the_Crusaders_to_Jerusalem_date_unknown_Canvas_Gallery_Wrapped_or_Framed_Giclee_Wall_Art_Print_D6045_nnvzhi.jpg"
export {cloudinary, defaultDpUrl, defaultCommunityDpUrl};