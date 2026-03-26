// API Configuration
const API_URL = process.env.REACT_APP_API_URL || (
  process.env.NODE_ENV === 'production' 
    ? window.location.origin 
    : 'https://wkcouplefinancing.onrender.com'
);

export default API_URL;
