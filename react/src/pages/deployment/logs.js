import React from 'react';
import { useLocation } from 'react-router-dom';

const LogsPage = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const logs = decodeURIComponent(params.get('data')) || 'No logs available';

    return (
        <div>
            <pre style={{color :'white'}}>{logs}</pre>
        </div>
    );
};

export default LogsPage;
