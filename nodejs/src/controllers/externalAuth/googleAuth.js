const { OAuth2Client } = require('google-auth-library');
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirectUri = process.env.GOOGLE_REDIRECT_URI;


const client = new OAuth2Client(clientId, clientSecret, redirectUri);


const googleAuth = async (req, res) => {
    const { credential } = req.body.response;
    if (!credential) {
        return res.status(209).json({ warn: 'No credential provided' });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: clientId,
        });

        const payload = ticket.getPayload();

        res.status(200).json({ info: 'Successful Google login', payload });
    } catch (error) {
        console.error('Google callback error:', error.message);
        res.status(500).json({ warn: 'Google login failed', error: error.message });
    }
};

module.exports = { googleAuth };
