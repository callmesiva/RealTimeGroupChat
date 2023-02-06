const jwt = require("jsonwebtoken");
const {promisify} = require("util");

exports.verifyCookie= async (req,res,next)=>{
        if(req.cookies.userID){
        const verification = await promisify(jwt.verify)(
            req.cookies.userID,
            process.env.JWT_KEY 
        );
        req.authID = verification.id;
        next();
    }
    else{
        res.sendStatus(401);
    }
}