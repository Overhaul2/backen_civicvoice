
const sendUserVoteConfirmation = async (userEmail, consultationTitle, voteHash) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: "Confirmation de votre participation - Civic Voice",
        html: `
            <div style="font-family: sans-serif; line-height: 1.5;">
                <h2>Votre vote a été pris en compte !</h2>
                <p>Vous venez de participer à la consultation : <strong>${consultationTitle}</strong></p>
                <p>Voici votre empreinte numérique de vote (Hash) :</p>
                <code style="background: #f4f4f4; padding: 10px; display: block;">${voteHash}</code>
                <p><em>Ce hash vous permettra de vérifier que votre vote n'a pas été modifié une fois qu'il sera ancré sur la blockchain à la fin du scrutin.</em></p>
                <hr>
                <p>L'équipe Civic Voice</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (err) {
        console.error("Erreur envoi email confirmation vote:", err.message);
    }
};

module.exports = sendUserVoteConfirmation;