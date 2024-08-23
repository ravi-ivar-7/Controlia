require('dotenv').config({ path: '../../../.env' });
const { MongoClient } = require('mongodb');
const { addToErrorMailQueue } = require('../../services/mail/manageMail');
const logger = require('../../services/logs/winstonLogger');

const githubClientId = 'Ov23liJhpyR8Kjsrq7x5';
const githubClientSecret = '613c1945f7b3eafadd05f3d524cb603c45cd6602';
const githubRedirectUri = 'http://localhost:3000/github-redirect';

const githubAuth = async (req, res) => {
    const client = new MongoClient(process.env.MONGODB_URL);


    let decodedToken, code;

    try {
        ({ decodedToken, code } = req.body);
        if (!code) {
            return res.status(209).json({ warn: 'Missing authorization code' });
        }


        // Request GitHub access token
        const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: githubClientId,
            client_secret: githubClientSecret,
            code: code,
            redirect_uri: githubRedirectUri,
        }, {
            headers: {
                'Accept': 'application/json'
            }
        });

        const accessToken = await tokenResponse.data.access_token;
        if (!accessToken) {
            return res.status(209).json({ warn: 'Failed to obtain access token' });
        }

        const repoResponse = await axios.get('https://api.github.com/user/repos', {
            headers: {
                'Authorization': `token ${accessToken}`
            },
            params: {
                visibility: 'all' // To include both public and private repositories
            }
        });
        const repos = await repoResponse.data;

        await client.connect();
        const db = client.db("controlia");
        const volumesCollection = db.collection('volumes')
        const volumes = await volumesCollection.find({ userId: decodedToken.userId }).toArray();

        return res.status(200).json({ info: 'GitHub authentication successful.', repos, accessToken, code, volumes });

    } catch (error) {
        logger.error(`Error during GitHub OAuth callback: ${error.message}`);

        let mailOptions = {
            from: process.env.FROM_ERROR_MAIL,
            subject: 'An error occurred during GitHub OAuth callback.',
            to: process.env.TO_ERROR_MAIL,
            text: `Function: githubAuth\nError: ${error.message}`,
        };

        addToErrorMailQueue(mailOptions)
            .then(() => {
                logger.info('Error mail added.');
            })
            .catch((mailError) => {
                logger.error(`Failed to add error mail alert. ${mailError.message}`);
            });

        return res.status(500).json({ warn: 'INTERNAL SERVER ERROR', error: error.message });
    }
};

module.exports = { githubAuth };
