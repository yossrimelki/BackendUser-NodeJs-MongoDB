const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require ("nodemailer");
const config = require("../config/config")
const randomstring = require ("randomstring");

const register = (req, res, next) => {
    bcrypt.hash(req.body.password, 10, function (err, hashedPass) {
        if (err) {
            return res.status(500).json({ error: 'An error occurred!' });
        }
 
        let user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPass,
        });

        if (req.file) {
            user.img = req.file.path;
        }

        user.save() 
            .then((user) => {
                res.json({
                    message: 'User Added Successfully!',
                });
            })
            .catch((error) => {
                res.status(500).json({ message: 'An error occurred!' });
            });
    });
};


const login = (req, res, next) => {
    var username = req.body.email;
    var password = req.body.password;

    User.findOne({ email: username })
        .then((user) => {
            if (!user) {
                return res.status(404).json({ message: 'No user found!' });
            }

            bcrypt.compare(password, user.password, function (err, result) {
                if (err || !result) {
                    return res.status(401).json({ message: 'Password does not match' });
                }

                let token = jwt.sign({ name: user.name }, 'yourSecretKey', {
                    expiresIn: '24h'
                });
                let refreshsecretkey = jwt.sign({ name: user.name }, 'refreshsecretkey', {
                    expiresIn: '48h'
                });
                res.status(200).json({
                    message: 'Login Successful!',
                    token,
                    refreshsecretkey,
                });
            });
        })
        .catch((error) => {
            res.status(500).json({ message: 'An error occurred!' });
        });
};



////////////////////////next Edit 
const sendresetPassword = async (name,email, token) =>{
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user:config.emailUser,
                pass:config.emailPassword
            }


        });
        const mailOptions = {
            from:config.emailUser,
            to:email,
            subject: 'For Reset Password',
            html: '<p> Hi '+name+', <br> Your Token Code Is : '+token+'<br> Copy it and reset your password Ѷ !'
        }
        transporter.sendMail(mailOptions,function(error,info){
            if(error){
                console.log(error);
            }else{
                console.log("Mail has been sent : ",info.response);
            }

        })

    }catch (error){
        res.status(400).send({success: false ,msg:error.message});

    }
}
const forgetpassword = async(req,res) => {
    try {
        const email = req.body.email;
        const userdata =  await User.findOne({email: email});
        if (userdata){
            const randomString = randomstring.generate();
            const data= await User.updateOne({email: email},{$set:{token: randomString}})
            sendresetPassword(userdata.name,userdata.email,randomString);
            res.status(200).send({success: true ,msg:"Please check Your Inbox of mail And reset your Password ."});

        } else{
            res.status(200).send({success: true ,msg:"This Email doen t exists!!"});

        }

    }catch (error)
    {
        res.status(400).send({success: false ,msg:error.message});
    }

}
const reset_password = async (req, res) => {
    try {
        const token = req.query.token; // Change 'req.Query.token' to 'req.query.token'
        const tokenData = await User.findOne({ token: token }); // Corrected query
        if (tokenData) {
            const password = req.body.password;
            const new_password = await securePassword(password);
            const userdata = await User.findByIdAndUpdate(
                { _id: tokenData._id },
                { $set: { password: new_password, token: '' } },
                { new: true }
            );
            res.status(200).send({ success: true, msg: "User Password has been Reset", data: userdata });
        } else {
            res.status(200).send({ success: false, msg: "This Link has been expired!" });
        }
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
};


const securePassword = async(password)=> {
    try{
        const passwordHash = await bcrypt.hash(password,10);
        return passwordHash;
    }catch (error){
        res.status(400).send(error.message);
    }
}



////////////////////////

module.exports = {
    register,
    login,forgetpassword,reset_password,
};