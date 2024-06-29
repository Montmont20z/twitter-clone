import jwt from 'jsonwebtoken';

export const generateTokenAndSetCookie = (userId, res) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn: '15d',
    })

    res.cookie("jwt", token, {
        maxAge: 15*24*60*60*1000, //in mili seconds, 15 days in this case
        httpOnly: true, // prevent XSS attack cross-site sciprting attacks
        sameSite: "strict", //CSRF attacks cross-site request forgery attacks
        secure: process.env.NODE_ENV !== "development", 
    })

};