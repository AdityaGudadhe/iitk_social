"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const neo4j_driver_1 = __importDefault(require("neo4j-driver"));
const URI = 'neo4j+s://75c04d10.databases.neo4j.io';
const USER = 'neo4j';
const PASSWORD = '6t5DBWc1aw08jjcR6HDXknZQzEipVyYDQzzSCliApqU';
let driver = neo4j_driver_1.default.driver(URI, neo4j_driver_1.default.auth.basic(USER, PASSWORD));
exports.default = driver;
