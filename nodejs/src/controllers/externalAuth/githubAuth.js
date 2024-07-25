const axios = require('axios');

const githubClientId = 'Ov23liJhpyR8Kjsrq7x5';
const githubClientSecret = '613c1945f7b3eafadd05f3d524cb603c45cd6602';
const githubRedirectUri = 'http://localhost:3000/github-redirect';

const githubAuth = async (req, res) => {
    const { code } = req.body;
    if (!code) {
        return res.status(209).json({ warn: 'Missing authorization code' });
    }

    try {
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
        const accessToken = tokenResponse.data.access_token;
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
        const repos = repoResponse.data;
        res.status(200).json({ info: 'GitHub auth successful.', repos, accessToken, code});

    } catch (error) {
        console.error('Error during GitHub OAuth callback:', error.message);
        res.status(500).json({ warn: 'Error during GitHub OAuth callback', error: error.message });
    }
};

module.exports = { githubAuth };
