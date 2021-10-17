const jwt = require('jsonwebtoken');
const config = require('config');

//import user model
const User = require('../models/User');

module.exports = async function (req,res,next){

    try{
        //get token from header
        const token = req.header('x-auth-token');

        //decode token
        const decoded = jwt.verify(token,config.get('jwtSecret'));

        //get user id
        const userId  = decoded.user.id;


        //find user
        const user =  await User.findById(userId);

        if(!user){
            return res.status(404).json({msg: 'Not found user,thrown by admin middleware'});
        }

        if(user.role == "admin"){
            next();
        }else {
            return res.status(401).json({msg: 'Not an Admin,authorization denied'});
        }

    }catch (err){
        console.error(err.message);
        return res.status(500).json('Server Error');
    }


}
