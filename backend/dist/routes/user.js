"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const init_1 = __importDefault(require("../db/init"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const JWT_SECRET = "Chandu ke chacha ne chandu ki chachi ko chandi ke chammach se chatni chatayi";
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
const userRouter = express_1.default.Router();
userRouter.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userBody = req.body;
    const session = init_1.default.session();
    const userId = userBody.userId;
    try {
        const userExists = yield session.run('MATCH (user:User {userId: $userId}) RETURN (user)', {
            userId
        });
        if (userExists.records.length == 0) {
            const user = yield session.run('CREATE(user:User { ' +
                'userId: $userId, ' +
                'name: $name, ' +
                'email: $email,' +
                'dpUrl: $dpUrl,' +
                'joinDate: date(),' +
                'created: datetime(),' +
                'bio: "",' +
                'location: "",' +
                'followerCount: 0,' +
                'followingCount: 0})', userBody);
            const token = jsonwebtoken_1.default.sign(user.records[0].get('user').properties, JWT_SECRET);
            res.cookie('user', token);
            res.status(200).json({ message: "user created", user: userExists.records[0].get('user').properties });
        }
        else {
            const token = jsonwebtoken_1.default.sign(userExists.records[0].get('user').properties, JWT_SECRET);
            res.cookie('user', token);
            res.status(200).json({ message: "user already existed", user: userExists.records[0].get('user').properties });
        }
    }
    catch (err) {
        console.log(err);
        res.status(411).json({
            err
        });
    }
    finally {
        yield session.close();
    }
}));
// userRouter.put("/update", async (req: express.Request, res: express.Response) => {
//     // const session = driver.session();
//     const cookie = req.cookies;
//     try{
//         const decodedCookie = jwt.verify(cookie.user, JWT_SECRET);
//         res.send(decodedCookie);
//
//     }
//     catch (e){
//         res.status(411).json({
//             e,
//             message: "wrong cookie"
//         })
//     }
// })
exports.default = userRouter;
