"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = __importDefault(require("./routes/user"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const update_1 = __importDefault(require("./routes/update"));
const app = (0, express_1.default)();
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use("/user", user_1.default);
app.use("/update", update_1.default);
app.get("/", (req, res) => {
    res.send("Hello");
});
console.log("listening on port 3000");
app.listen(3000);
