import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../../services/axiosInstance';
import useToast from '../../hooks/useToast';
import { useUser } from '../../context/UserContext';

const GitHubRedirect = () => {
    const { showErrorToast, showSuccessToast } = useToast();
    const [repos, setRepos] = useState([]);
    const [selectedRepos, setSelectedRepos] = useState([]);
    const [code, setCode] = useState('')
    const [accessToken, setAccessToken] = useState('')

    const { user, setUser } = useUser();
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const code = queryParams.get('code');

        if (code) {
            const authenticateAndRedirect = async () => {
                setLoading(true);
                try {
                    const response = await axiosInstance.post('/github-auth', { code });
                    if (response.status === 200) {
                        setRepos(response.data.repos);
                        setCode(response.data.code)
                        setAccessToken(response.data.accessToken)
                        showSuccessToast('Successfully authenticated with GitHub!');

                        console.log('User repositories:', response.data);
                    }
                    else {
                        console.error('Internal Server Error:', response.data.warn);
                        showErrorToast(response.data.warn || 'Internal Server Error');
                    }
                } catch (error) {
                    console.error('Error fetching repositories:', error);
                    showErrorToast('Failed to authenticate with GitHub.');
                } finally {
                    setLoading(false);
                }
            };

            authenticateAndRedirect();
        }
    }, []);

    const handleSelectRepo = (repoName) => {
        setSelectedRepos(prev => {
            if (prev.includes(repoName)) {
                return prev.filter(name => name !== repoName);
            }
            return [...prev, repoName];
        });
    };


    const handleGetRepo = async () => {
        try {
            const response = await axiosInstance.post('/github-repo', { code, selectedRepos, accessToken });

            if (response.status === 200) {
                console.log('Repositories processed:', response.data);
                showSuccessToast(response.data.info)
                console.log(response.data.zipUrl)
            }
            else {
                console.error('Internal Server Error:', response.data.warn);
                showErrorToast(response.data.warn || 'Internal Server Error');
            }

        } catch (error) {
            console.error('Error processing repositories:', error);
            showErrorToast(`Failed to process repositories.`);
        }
    };


    return (
        <div>
            <h1>GitHub Authentication</h1>
            {!loading ? (


                <div>
                    <h2>Select Repositories</h2>
                    <ul>
                        {repos.map(repo => (
                            <li key={repo.id}>
                                <input
                                    type="checkbox"
                                    checked={selectedRepos.includes(repo)}
                                    onChange={() => handleSelectRepo(repo)}
                                />
                                {repo.name}
                            </li>
                        ))}
                    </ul>

                    <button onClick={handleGetRepo}>Submit</button>
                </div>



            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default GitHubRedirect;
