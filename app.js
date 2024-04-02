const fs = require('fs');
const os = require('os');
const yaml = require('js-yaml');
const express = require("express");
const db = require("./connectMysql");

const file = fs.readFileSync("./config.yml",{
    encoding:"utf-8"
});
const config = yaml.load(file);
const port = config.server.port;
const path = config.server.path;
const cross = config.server.cross;
const dataSheet = config.mysql.dataSheet;
const startYear = config.data.startYear;
const endYear = config.data.endYear;

const app = express();

app.use(express.text());
app.use(express.json());
app.post(path,function(req,res){

    if(cross){
        // 请求跨域
        res.setHeader("Access-Control-Allow-Origin", "*");  
        res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PUT, GET");  
        res.setHeader("Access-Control-Max-Age", "3600");
        res.setHeader("Access-Control-Allow-Headers", "**");
    }

    let data = {}
    try{
        if(typeof req.body=="string")req.body=JSON.parse(req.body);
        if(JSON.stringify(req.body)=="{}")throw new Error("没有请求参数！");
        if(typeof req.body.startYear !="number" || typeof req.body.endYear !="number"){
            throw new Error("参数错误！");
        }
        if(req.body.startYear>endYear||req.body.startYear<startYear)throw new Error("参数错误！");
        if(req.body.endYear>endYear||req.body.endYear<startYear)throw new Error("参数错误！");
        if(req.body.endYear-req.body.startYear<0)throw new Error("参数错误！");
        
        let sql = `select * from ${dataSheet} where year between ${req.body.startYear} and ${req.body.endYear}`;
        db.query(sql,function(err,msg){
            if(err)throw err;
            data.code = "200";
            data.msg="获取成功！";
            data.data=msg;
            res.send(data);
        });
    }catch(err){
        data.msg = err.message;
        data.code = "400"; 
        res.send(data);
    }
});

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const interfaceName in interfaces) {
      const interface = interfaces[interfaceName];
      for (const interfaceInfo of interface) {
        if (interfaceInfo.family === 'IPv4' && !interfaceInfo.internal) {
          return interfaceInfo.address;
        }
      }
    }
    return undefined; // 如果没有找到合适的IP地址，则返回undefined
  }

app.listen(port,function(err){
    const ip = getLocalIP();
    if(!err){
        console.log(`Local: http://localhost:${port}${path}`);
        if(ip){
            console.log(`Network: http://${ip}:${port}${path}`);
        }
    }
});