const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
                    expiresIn: '30s'
                });
                let refreshsecretkey = jwt.sign({ name: user.name }, 'refreshsecretkey', {
                    expiresIn: '48h'
                });

                res.json({
                    message: 'Login Successful!',
                    token,
                    refreshsecretkey
                });
            });
        })
        .catch((error) => {
            res.status(500).json({ message: 'An error occurred!' });
        });
};

module.exports = {
    register,
    login,
};
