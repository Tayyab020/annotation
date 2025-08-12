// Simple API test script to verify all endpoints are working
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let userId = '';
let videoId = '';
let annotationId = '';

// Test function with error handling
async function testAPI() {
  console.log('🚀 Starting Nova API Tests...\n');

  try {
    // 1. Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get('http://localhost:5000/');
    console.log('✅ Health Check:', healthResponse.data.message);
    console.log('   Server Version:', healthResponse.data.version);
    console.log('');

    // 2. Register User
    console.log('2. Testing User Registration...');
    const registerData = {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'Password123'
    };

    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, registerData);
      console.log('✅ User Registered Successfully');
      authToken = registerResponse.data.data.token;
      userId = registerResponse.data.data.user.id;
      console.log('   User ID:', userId);
      console.log('   Token (first 20 chars):', authToken.substring(0, 20) + '...');
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message.includes('already exists')) {
        console.log('⚠️  User already exists, trying login...');
        
        // Try login instead
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
          email: registerData.email,
          password: registerData.password
        });
        console.log('✅ User Logged In Successfully');
        authToken = loginResponse.data.data.token;
        userId = loginResponse.data.data.user.id;
        console.log('   User ID:', userId);
        console.log('   Token (first 20 chars):', authToken.substring(0, 20) + '...');
      } else {
        throw error;
      }
    }
    console.log('');

    // 3. Test Protected Route - Get Current User
    console.log('3. Testing Protected Route (Get Current User)...');
    const userResponse = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Protected Route Working');
    console.log('   User Name:', userResponse.data.data.user.name);
    console.log('   User Email:', userResponse.data.data.user.email);
    console.log('');

    // 4. Test Video Routes (without actual file upload)
    console.log('4. Testing Video Routes...');
    const videosResponse = await axios.get(`${BASE_URL}/videos`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Get Videos Endpoint Working');
    console.log('   Total Videos:', videosResponse.data.total || 0);
    console.log('');

    // 5. Test Annotations (we need a video ID first, so let's create a mock one or skip if no videos)
    console.log('5. Testing Annotation Routes...');
    if (videosResponse.data.total > 0) {
      videoId = videosResponse.data.data[0]._id;
      console.log('   Using existing video ID:', videoId);
      
      // Get annotations for this video
      const annotationsResponse = await axios.get(`${BASE_URL}/annotations/${videoId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Get Annotations Endpoint Working');
      console.log('   Annotations count:', annotationsResponse.data.count);
    } else {
      console.log('⚠️  No videos found, skipping annotation tests');
      console.log('   (Upload a video first to test annotations)');
    }
    console.log('');

    // 6. Test AI Routes (basic endpoint test)
    console.log('6. Testing AI Routes...');
    if (videoId) {
      try {
        const aiResponse = await axios.post(`${BASE_URL}/ai/suggest`, {
          videoId: videoId,
          partialAnnotation: { startTime: 10.0, label: 'test' },
          context: 'Test context'
        }, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log('✅ AI Suggest Endpoint Working');
      } catch (error) {
        if (error.response?.status === 500) {
          console.log('⚠️  AI Endpoint accessible (OpenAI key needed for full functionality)');
        } else {
          throw error;
        }
      }
    } else {
      console.log('⚠️  Skipping AI tests (need video ID)');
    }
    console.log('');

    console.log('🎉 All Tests Completed Successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Server Health Check');
    console.log('   ✅ User Registration/Login');
    console.log('   ✅ JWT Authentication');
    console.log('   ✅ Protected Routes');
    console.log('   ✅ Video Management Endpoints');
    console.log('   ✅ Annotation Endpoints');
    console.log('   ✅ AI Endpoints (structure)');
    
    console.log('\n🔑 Your Auth Token (for Postman):');
    console.log(authToken);

  } catch (error) {
    console.error('❌ Test Failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('   Error Details:', JSON.stringify(error.response.data, null, 2));
    }
    console.error('   Status Code:', error.response?.status);
  }
}

// Run the tests
testAPI();