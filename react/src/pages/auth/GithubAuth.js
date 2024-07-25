import React from 'react';

const GitHubAuth = () => {
    return (
        <div>
            <h1>GitHub Authentication</h1>

            <a href={`https://github.com/login/oauth/authorize?client_id=Ov23liJhpyR8Kjsrq7x5&redirect_uri=http://localhost:3000/github-redirect&scope=repo`}>
                Login with GitHub
            </a>
        </div>
    );
};

export default GitHubAuth;
