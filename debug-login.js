// Debug script to test login API connection
async function testLogin() {
  console.log('Testing login API...');
  
  try {
    const response = await fetch('http://127.0.0.1:5000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@gmail.com',
        password: '123456'
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    const data = await response.json();
    console.log('Response data:', data);
    
    if (response.ok) {
      console.log('✅ Login successful!');
      console.log('Token:', data.access_token);
    } else {
      console.log('❌ Login failed:', data.error);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

// Test backend connectivity
async function testBackend() {
  console.log('Testing backend connectivity...');
  
  try {
    const response = await fetch('http://127.0.0.1:5000/test');
    console.log('Test response status:', response.status);
    
    const data = await response.json();
    console.log('Test response data:', data);
  } catch (error) {
    console.error('Backend test failed:', error);
  }
}

// Run tests
testBackend();
testLogin();
