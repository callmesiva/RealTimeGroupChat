const db = require("../database/database");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const { response, query } = require("express");

exports.main=(req,res)=>{
    res.render("login");
}

exports.login =(req,res)=>{
   const{email,password}=req.body;
   db.query("select * from logindata where email =?",[email],async(err,result)=>{
        if(!err){
            if(result==""){
                res.render("login",{msg:"You dont have an account please signup"})
            }
            else {
                if(await bcrypt.compare(password, result[0].password)){
                    const id = result[0].id;
                    const token = jwt.sign({id:id}, process.env.JWT_KEY);
                    res.cookie("userID",token);
                    db.query("SELECT name,groupId,isAdmin FROM chatapp.room JOIN chatapp.groupusers ON chatapp.room.id = chatapp.groupusers.groupId where userId=?",[result[0].id],(err,response)=>{
                        if(!err){
                          
                            response.forEach(element => {
                                if(element.isAdmin !=result[0].id){
                                    element.isAdmin=null;
                                }
                            });
                          
                            res.render("home",{response})
                        }
                    })
                }
                else{
                    res.render("login",{msg:"Password incorrect"})
                }
            }
        }
    })
}


exports.signup=(req,res)=>{
    const{name,email,password} = req.body;
    db.query("select email from logindata where email=?",[email],async(err,result)=>{
        if(!err){
            if (result=="") {
                const passwordhash = await bcrypt.hash(password,10);
                db.query("insert into logindata(name,email,password) values(?,?,?)",[name,email,passwordhash],(err,result1)=>{
                    if(!err){
                        res.render("login",{msg:"Account created sucessfully!"})
                    }
                })
            }
            else{
                res.render("login",{msg:"Already you have an account!"})
            }
        }
    })
}


exports.groupchat=(req,res)=>{
    const groupId = req.params.id;
    const Gname = req.params.groupname;
    // let query ="SELECT logindata.name, messages.message FROM chatapp.logindata join chatapp.messages where messages.userId = logindata.id and messages.groupId=? order by messages.id"
    // db.query(query,[groupId],(err,resolve)=>{
    //     if(!err){
    //         res.render("groupchat",{Gname,groupId,resolve});
    //     }
    //     else{
    //         console.log(err);
    //     }
    // })
    res.render("groupchat",{Gname,groupId});
   
    
}

exports.creategroup=(req,res)=>{
    res.render("createGroup")
}

exports.addusers=(req,res)=>{
    const {groupname} = req.body;
    const userID = req.authID;
   
    db.query("insert into room(name) values(?)",[groupname],(err,response)=>{
        if(!err){
            db.query("select id from room where name=?",[groupname],(err,result)=>{
                if(!err){
                    const groupId = result[0].id;

                    db.query("insert into groupusers(isAdmin,groupId,userId) values(?,?,?)",[Number(userID),Number(groupId),Number(userID)],(err,result)=>{

                      if(!err){
                         db.query("select * from logindata where id !=?",[userID],(err,users)=>{
                           if(!err){
                             
                             let userValues = users.map((value)=>{
                               return{id:value.id, name:value.name, groupId:groupId}
                             })
                            
                              res.render("createGroup",{userValues});
                            }
                         })
                       }
                    }); 
                }
            })
        }
    })    
}


exports.addusertogroup =(req,res)=>{
    const AdminId = req.authID;
    const groupUserId = req.params.id;
    const groupId = req.params.groupid;

    db.query("insert into groupusers(isAdmin,groupId,userId) values(?,?,?)",[Number(AdminId),Number(groupId),Number(groupUserId)],(err,result)=>{
        if(!err){
           
           db.query("SELECT logindata.name FROM chatapp.groupusers join logindata where groupId=? and logindata.id =groupusers.userId",[groupId],(err,namez)=>{
            if(!err){
                     
                db.query("select * from logindata where id !=?",[AdminId],(err,users)=>{
                    if(!err){
                         
                     
                        for (let i = 0; i < namez.length; i++) {

                            for (let j =0; j < users.length; j++)
                            {
                                  if(namez[i].name==users[j].name){
                                      users.splice(j,1);
                                  }
                            }  
                          }
 
                      
                        let userValues = users.map((value)=>{
                          return{id:value.id, name:value.name, groupId:groupId}
                       })
                        
                       res.render("createGroup",{userValues});
                    }
                })
    
             }
           });
        }
        else{
            console.log(err);
        }
    })
}


exports.home =(req,res)=>{

    const userId = req.authID;
    db.query("SELECT name,groupId,isAdmin FROM chatapp.room JOIN chatapp.groupusers ON chatapp.room.id = chatapp.groupusers.groupId where userId=?",[userId],(err,response)=>{
        if(!err){

            response.forEach(element => {
                if(element.isAdmin !=userId){
                    element.isAdmin=null;
                }
            });

            res.render("home",{response})
        }
    })
}


exports.removeUser =(req,res)=>{
    const gId = req.params.groupId;
    const query1 ="SELECT isAdmin,groupId,userId,name FROM groupusers join logindata on groupusers.userId =logindata.id where groupId =? and isAdmin != userId;";
    db.query(query1,[gId],(err,result)=>{
        if(!err){
            res.render("removeUser",{result});
        }
        else{
            console.log(err);
        }
    })

}

exports.removefromgroup=(req,res)=>{
    const {groupId,userId} =req.params;
    db.query("delete from groupusers where userId=? and groupId=?",[userId,groupId],(err,response)=>{
        if(!err){
            
            const query1 ="SELECT isAdmin,groupId,userId,name FROM groupusers join logindata on groupusers.userId =logindata.id where groupId =? and isAdmin != userId;";
            db.query(query1,[groupId],(err,result)=>{
                if(!err){
                    res.render("removeUser",{result});
                }
                else{
                    console.log(err);
                }
            })


        }
    })
}
























//apicall
exports.getusername=(req,res)=>{
    const userId = req.authID;
    db.query("select name from logindata where id=?",[userId],(err,result)=>{
        res.send(result[0].name);
    })
}

exports.storemessageonDB =(req,res)=>{
       let userId = req.authID;
       let {message,from,groupId} = req.body;
      if(from  == "ChatBot"){
        res.sendStatus(200);
      }
      else{
        db.query("insert into messages(message,sender,userId,groupId) values(?,?,?,?)",[message,from,userId,Number(groupId)],(err,response)=>{
            if(!err){
                res.sendStatus(200);
            }
            else{
                console.log(err);
            }
         })
      }
  
}

exports.getmessages =(req,res)=>{
     const userId = req.authID;
     const groupId = req.params.groupId;
     let query ="SELECT logindata.name, messages.message FROM chatapp.logindata join chatapp.messages where messages.userId = logindata.id and messages.groupId=? order by messages.id"
     db.query(query,[groupId],(err,resolve)=>{
         if(!err){
             res.send(resolve);
         }
         else{
             console.log(err);
         }
     })
    
}

