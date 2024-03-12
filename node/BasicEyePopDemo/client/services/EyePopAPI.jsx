import axios from 'axios';

export const getSession = {
    getSessionData: async () =>
    {
        try
        {
            const response = await axios.get('/eyepop/session');
            const data = await response.json();

            return data;
        } catch (error)
        {
            console.error('Error fetching session data:', error);
            throw error;
        }
    }
};
