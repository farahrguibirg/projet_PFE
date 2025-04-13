const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmail = async (req, res) => {
  const { email, user_id } = req.body;

  if (!email || !user_id) {
    return res.status(400).json({ message: "Email et identifiant requis" });
  }

  console.log("➡ Envoi d'email à :", email);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  try {
    await transporter.verify();

    const mailOptions = {
      from: `"SmartPFE" <${process.env.SMTP_FROM_EMAIL}>`,
      to: email,
      subject: "Vos informations de connexion",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4F46E5;">Vos informations de connexion</h2>
          <p>Bonjour,</p>
          <p>Voici vos identifiants pour accéder à l'application :</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Email :</strong> ${email}</p>
            <p><strong>Mot de passe :</strong> ${user_id}</p>
          </div>
          <p>Connectez-vous ici : 
            <a href="${process.env.APP_URL}" style="color: #4F46E5;">${process.env.APP_URL}</a>
          </p>
          <p>Cordialement,</p>
          <p>L'équipe technique</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error("Erreur SMTP :", error);
    res.status(500).json({ 
      success: false, 
      message: "Échec de l'envoi",
      error: error.message 
    });
  }
};

module.exports = { sendEmail };