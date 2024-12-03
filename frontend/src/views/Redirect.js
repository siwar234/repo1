import React ,{useEffect} from 'react'




export default function Redirect() {

  const hash = window.location.hash; // e.g., "#/join/jointeam/?equipeId=12345&token=abcdef"

  const queryString = hash.split('?')[1]; // "equipeId=12345&token=abcdef"
  
    useEffect(() => {
        // Function to extract token from URL params
        const getTokenFromParams = () => {
          const params = new URLSearchParams(queryString);
          const token = params.get('token');
          if (token) {
            // Store token in local storage
            localStorage.setItem('token', token);
            // Get userid from URL params
            const userId = params.get('id');
            // Redirect to profile page with token and userid
            window.location.href = `http://192.168.1.178/#/profileuser/${token}/${userId}`;
          }
        };
    
        // Call the function when component mounts
        getTokenFromParams();
      }, []); // Empty dependency array ensures this effect runs only once

  return (
    <div>loading..</div>
  )
}
