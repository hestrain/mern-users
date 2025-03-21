import {resend} from './config.js'
import {verificationTokenEmailTemplate, welcomeEmailTemplate} from './email-templates.js'

export const sendVerificationEmail = async (email, verificationToken) => {
    try {
        const {data, error} = await resend.emails.send({
            from:"Acme <onboarding@resend.dev>",
            to:[email],
            subject:"Verify Your Email Address Now",
            html: verificationTokenEmailTemplate.replace("{verificationToken}", verificationToken),
        })
        
    } catch (error) {
        console.log("error sending verification email", error);
        throw new Error("error sending verification email")
    }
}

export const sendWelcomeEmail = async (email, username) => {
    try {
        const {data, error} = await resend.emails.send({
            from:"Acme <onboarding@resend.dev>",
            to:[email],
            subject:"Welcome to the W33dSite",
            html: welcomeEmailTemplate.replace("{username}", username, ),
        })
        
    } catch (error) {
        console.log("error sending verification email", error);
        throw new Error("error sending verification email")
    }
}

export const sendPasswordResetEmail = async (email, resetURL) => {
    try {
        const {data, error} = await resend.emails.send({
            from:"Acme <onboarding@resend.dev>",
            to:[email],
            subject:"Reset your Password",
            html:  `Click <a href="${resetURL}">here</a> to reset your password`
        })
        
    } catch (error) {
        console.log("error sending verification email", error);
        throw new Error("error sending verification email")
    }
}
export const sendResetSuccessEmail = async (email) => {
    try {
        const {data, error} = await resend.emails.send({
            from:"Acme <onboarding@resend.dev>",
            to:[email],
            subject:"Password Reset Successful!",
            html:  `Your password has been reset successfully!`
        })
        
    } catch (error) {
        console.log("error sending password reset success email", error);
        throw new Error("error sending password reset success email")
    }
}