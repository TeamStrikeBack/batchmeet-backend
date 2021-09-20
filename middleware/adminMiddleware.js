const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req,res){

    // Get token from the header
    const token = req.header('x-auth-token');

    //check if not token
    if(!token){
        return res.status(401).json({msg: 'No token,authorization denied'});
    }

    try{
        const decoded = jwt.verify(token,config.get('jwtSecret'));

        const userType  = decoded.user.role;


        if(userType.toString()=="admin"){
            return true;
        }else {
            return false;
        }

    }catch (err){
        console.error(err.message);
        return res.status(500).json('Server Error');
    }


}
