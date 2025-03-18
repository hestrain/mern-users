import jwt from 'jsonwebtoken'

export const generateJWTToken = (res, userId) => {
     const token = jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn: '7d'
     })
     res.cookie('token', token, {
        httpOnly: true, //cannot be accecend by client side scripts
        secure: process.env.NODE_ENV === "production", // only set on hhttps
        sameSite: 'strict', //only go to same site
        maxAge: 7 * 24 * 60 * 60 * 1000 //7days
     })
}