"use strict";
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
const updateRouter = express_1.default.Router();
updateRouter.put("/bio", (req, res) => {
    const session = init_1.default.session();
    const newBio = req.body.bio;
    let decodedCookie = null;
    try {
        decodedCookie = jsonwebtoken_1.default.verify(req.cookies.user, JWT_SECRET);
    }
    catch (e) {
        res.status(411).json(e);
    }
    // const userId:string =
});
exports.default = updateRouter;
