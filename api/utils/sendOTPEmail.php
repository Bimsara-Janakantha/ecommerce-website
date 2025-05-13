<?php
function sendOtpEmail($toEmail, $otp)
{
    $subject = "Your SOLE HAVEN Email Verification Code";
    $message = "
        <html>
        <head><title>Email Verification</title></head>
        <body>
            <p>Hi there,</p>
            <p>Your One-Time Password (OTP) for verifying your email is:</p>
            <h2>$otp</h2>
            <p>This code will expire in 10 minutes.</p>
            <p>Thank you for registering with <strong>SOLE HAVEN</strong>.</p>
        </body>
        </html>
    ";
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: econductorinfo@gmail.com" . "\r\n";

    return mail($toEmail, $subject, $message, $headers);
}
