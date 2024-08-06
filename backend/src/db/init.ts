import neo4j from 'neo4j-driver';

const URI = 'neo4j+s://75c04d10.databases.neo4j.io'
const USER = 'neo4j'
const PASSWORD = '6t5DBWc1aw08jjcR6HDXknZQzEipVyYDQzzSCliApqU'
let driver = neo4j.driver(URI,  neo4j.auth.basic(USER, PASSWORD))

export default driver;
