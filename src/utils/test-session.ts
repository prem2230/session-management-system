// src/utils/test-session.ts
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/v1/auth';

const testSession = async () => {
    try {
        // Register
        console.log('1. Testing Registration...');
        const registerRes = await axios.post(`${BASE_URL}/register`, {
            username: 'testuser',
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            age: 25,
            mobile: 1234567890,
            password: 'Test@123',
            confirmPassword: 'Test@123'
        });
        console.log('✅ Registration:', registerRes.data.message);

        // Login
        console.log('\n2. Testing Login...');
        const loginRes = await axios.post(`${BASE_URL}/login`, {
            email: 'test@example.com',
            password: 'Test@123'
        });
        console.log('✅ Login:', loginRes.data.message);

        const { token, sessionId } = loginRes.data;

        // Get Profile
        console.log('\n3. Testing Protected Route...');
        const profileRes = await axios.get(`${BASE_URL}/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'x-session-id': sessionId
            }
        });
        console.log('✅ Profile:', profileRes.data.user.email);

        // Logout
        console.log('\n4. Testing Logout...');
        const logoutRes = await axios.post(`${BASE_URL}/logout`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'x-session-id': sessionId
            }
        });
        console.log('✅ Logout:', logoutRes.data.message);

    } catch (error: any) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
};

testSession();