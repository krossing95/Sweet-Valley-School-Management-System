import { MESSAGES } from "../../static/index.js"

export default function PasswordRecoveryLinkTemplate(name, link) {
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
                        <h3 style="font-size: 25px; color: #F2007A;">Password Recovery</h3>
                        <p style="line-height: 30px; padding-bottom: 10px; color: #000000; font-size: 18px;">Hi ${name},</p>
                        <p style="line-height: 30px; padding-bottom: 10px; color: #000000;">We have received your request to alter your password. Please click on the button below to execute the action.</p>
                        <b style="line-height: 30px; padding-bottom: 10px; color: #000000;">Due to security reasons, the link is only usable within 30 minutes. If you do not expect to receive this message, quickly log into your account and change password to a stronger one, as someone may have guessed your credentials.</b>
                        <br><br><br>
                        <a style="padding: 20px; color: #000000; background-color: #F2007A; border-radius: 5px; text-decoration: none; text-transform: uppercase;" href='${link}'>click here</a>
                        <br><br><br>
                        <p style="line-height: 20px; padding-bottom: 10px; color: #000000;">Thank you</p>
                        <p style="line-height: 20px; padding-bottom: 10px; color: #000000;">${TEMPLATE_SIGNATURE}</p>
                    </div>
                </div>
            </body>
        </html>
    `
    return template
}