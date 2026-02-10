require("dotenv").config({ path: __dirname + "/../config.env" });

const sendEmail = require("./email");

(async () => {
  try {
    await sendEmail({
      email: "Yousef204b@gmail.com",
      subject: "AI-CRS Email Verification  ",
      text: "Hello Mr.Yousef we're welcoming you and thanks to join out AI-CRS plase click on the link to verify your register.",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h1 style="color: #4CAF50;">Hello Bashar! 🚀</h1>
          <p>This is a <strong>test email</strong> sent using <em>Nodemailer</em> with custom HTML content.</p>
          <ul>
            <li>Reset Password</li>
            <li>Email Varification</li>
          </ul>
          <p style="margin-top: 20px;">Cheers,<br/>AI-CRS App</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("\n❌ Email failed!");
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    console.error("Full error:", err);
  }
})();
