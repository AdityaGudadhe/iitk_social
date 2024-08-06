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
const app = (0, express_1.default)();
app.use(express_1.default.json());
const userRouter = express_1.default.Router();
userRouter.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
                'joinDate: date()' +
                'created: datetime()', userBody);
            res.status(200).json({ message: "user created", user: user.records[0] });
        }
        else {
            res.status(200).json({ message: "user already existed", user: userExists.records[0] });
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
userRouter.put("/login", (req, res) => { });
exports.default = userRouter;
