const User = require('../models/User');

const sendTokenResponse=(user, statusCode, res)=>{
    //Create Token
    const token = user.getSignedJwtToken();

    const option = {
        expire:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRE*24*60*60*1000),
        httpOnly:true
    };

    if(process.env.NODE_ENV==='production'){
        option.secure = true;
    }
    res.status(statusCode).cookie('token', token, option).json({
        success: true,
        token,
        user: {
            id: user._id,       // Include user ID
            name: user.name,    // Include name
            email: user.email,  // Include email
            role: user.role,     // Include role
            payment: user.payment
        }
    })
}

//@desc     Register user
//@route    POST /api/v1/auth/register
//@access   Public
exports.register=async (req,res,next)=>{
    try{
        const {name, email, password, tel, address, role}=req.body;

        //Create user
        const user=await User.create({
            name,
            email,
            password,
            tel,
            address,
            role
        });

        //Create token
        // const token=user.getSignedJwtToken();
        // res.status(200).json({success:true, token});
        sendTokenResponse(user,200,res);

    }catch(err){
        res.status(400).json({success:false});
        console.log(err.stack);
    }
}

//@desc     Login user
//@route    POST /api/v1/auth/login
//@access   Public
exports.login=async (req,res,next)=>{
    try{

        const {email, password} = req.body;

        //Validate email & password
        if(!email || !password) {
            return res.status(400).json({success:false, msg: 'Please provide an email and password'});
        }

        //Check for user
        const user = await User.findOne({email}).select('+password');
        if(!user) {
            return res.status(400).json({success:false, msg: 'Invalid credentials'});
        }

        //Check if password matches
        const isMatch = await user.matchPassword(password);

        if(!isMatch) {
            return res.status(401).json({success:false, msg: 'Invalid credentials'});
        }

        //Create token
        // const token = user.getSignedJwtToken();
        // res.status(200).json({success:true, token});
        sendTokenResponse(user,200,res);

    } catch(err) {
        return res.status(401).json({success:false, msg:'Cannot convert email or password to string'});
    }
}

//@desc     Logout user out / clear cookie
//@route    POST /api/v1/auth/logout
//@access   Private
exports.logout=async (req,res,next)=>{
    res.cookie('token','none', {
        expire: new Date(Date.now() + 10*1000),
        httpOnly:true
    });

    res.status(200).json({
        success:true,
        data:{}
    });
}

//At the end of file
//@desc     Get current Logged user
//@route    POST /api/v1/auth/register
//@access   Private
exports.getMe=async (req,res,next)=>{
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success:true,
        data:user
    });
}