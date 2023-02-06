const express = require('express');
const route = express.Router();
const userControl = require("../controller/userControl");
const cookieAuth = require("../middleware/cookieAuth");

route.get("/",userControl.main);
route.post("/sign",userControl.signup);
route.post("/home",userControl.login);
route.get("/group/:groupname/:id",cookieAuth.verifyCookie,userControl.groupchat);
route.get("/creategroup",cookieAuth.verifyCookie,userControl.creategroup);
route.post("/adduserspage",cookieAuth.verifyCookie,userControl.addusers);
route.get("/addusertogroup/:groupid/:id",cookieAuth.verifyCookie,userControl.addusertogroup);
route.get("/home",cookieAuth.verifyCookie,userControl.home);
route.get("/removeuser/:groupId",cookieAuth.verifyCookie,userControl.removeUser);
route.get("/removefromgroup/:groupId/:userId",cookieAuth.verifyCookie,userControl.removefromgroup);




//apicalls
route.get('/getusername',cookieAuth.verifyCookie,userControl.getusername);
route.post('/storemessageonDB',cookieAuth.verifyCookie,userControl.storemessageonDB);
route.get('/getmessages/:groupId',cookieAuth.verifyCookie,userControl.getmessages);
module.exports=route;