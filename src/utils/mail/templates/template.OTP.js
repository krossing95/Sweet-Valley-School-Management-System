import { MESSAGES } from "../../static/index.js"

export default function OTPDataTemplate(code) {
    const { TEMPLATE_SIGNATURE } = MESSAGES.MAILS
    const template = `
        <!DOCTYPE html>
        <html lang="en" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml">
        <head>
            <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
            <meta content="width=device-width, initial-scale=1.0" name="viewport" />
            <link href="http://fonts.cdnfonts.com/css/plance" rel="stylesheet" type="text/css">
            <link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet" type="text/css" />
        </head>
        <body style="padding: 0; margin: 0; box-sizing: border-box; background-color: #ffffff; -webkit-text-size-adjust: none;
            text-size-adjust: none; font-family: 'Plance', sans-serif !important; color: #000000;">
            <div style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; margin: 5px; padding: 20px;">
                <div class="wrapper" style="max-width: 450px; margin: 0 auto; display: block;">
                    <img style="padding-bottom: 25px;" src="https://res.cloudinary.com/dkvrugn3r/image/upload/v1675624866/svs_ckonwl.png" width="100"
                        alt="App logo" />
                    <h3 style="font-size: 30px; color: #F2007A;">OTP Verification</h3>
                    <p style="line-height: 30px; padding-bottom: 10px; color: #000000;">Our inbuilt Two Factor Authentication System requires that you confirm your identity with the 5-digit
                        code below in order to complete
                        your
                        login process.</p>
                    <b style="line-height: 30px; padding-bottom: 10px; color: #000000;">Warning: Do not issue the code to any third party</b>
                    <h3 style="letter-spacing: 3px; padding-bottom: 10px; font-size: 30px; color: #F2007A;">${code}</h3>
                    <p style="line-height: 20px; padding-bottom: 10px; color: #000000;">Thank you</p>
                    <p style="line-height: 20px; padding-bottom: 10px; color: #000000;">${TEMPLATE_SIGNATURE}</p>
                </div>
            </div>
        </body>
        </html>
    `
    return template
}