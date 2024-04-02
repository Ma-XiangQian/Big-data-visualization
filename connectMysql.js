const mysql = require('mysql8.0');
const fs = require('fs');
const yaml = require('js-yaml');

const file = fs.readFileSync("./config.yml",{
  encoding:"utf-8"
});
const config = yaml.load(file);

// 建立一个连接池
const db = mysql.createConnection({
  host: config.mysql.adress,
  user: config.mysql.user,
  password: config.mysql.password,
  database: config.mysql.dataBase,
  port: config.mysql.port
});

module.exports = db;