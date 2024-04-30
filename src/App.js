import React, { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import axios from 'axios';
import awsExports from './aws-exports';
import styled from 'styled-components';

Amplify.configure(awsExports);
const TopBar = styled.div`
  background-color: #007bff;
  color: #fff;
  padding: 10px 20px;
`;

const MainContainer = styled.main`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Heading = styled.h1`
  color: #04f8b4d8;
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: ${(props) => (props.clicked ? '#0056b3' : '#007bff')}; /* Changed color to blue */
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;


const Alert = styled.div`
  padding: 10px;
  background-color: ${(props) => (props.type === 'success' ? '#28a745' : '#04f8b4d8')}; /* Changed color */
  color: #fff;
  border-radius: 4px;
  margin-bottom: 20px;
`;


const FormContainer = styled.div`
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-top: 4px solid #007bff; /* Add top border */
`;


const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  font-weight: bold;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const QuoteContainer = styled.div`
  margin-top: 20px;
`;

const Quote = styled.p`
  font-size: 18px;
`;
const Greeting = styled.h1`
  color: #333;
`;

function App() {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    mobileNumber: '',
    field: ''
  });

  const [fields, setFields] = useState([]);
  const [user, setUser] = useState(null);
  const [userDataFound, setUserDataFound] = useState(false);
  const [quote, setQuote] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [formVisible, setFormVisible] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buttonClicked, setButtonClicked] = useState(false); // State to track if submit button clicked

  useEffect(() => {
    async function fetchFields() {
      try {
        const response = await axios.get('http://a91987fa1ecfd4e7789588d72281d2e5-2098057441.us-east-1.elb.amazonaws.com/api/v1/field/getAllUsers');
        if (response.data.code === '00') {
          setFields(response.data.content);
        } else {
          console.error('Failed to fetch fields:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching fields:', error.message);
      }
    }

    fetchFields();
  }, []);

  useEffect(() => {
    async function checkUserData() {
      try {
        const response = await axios.get(`http://a91987fa1ecfd4e7789588d72281d2e5-2098057441.us-east-1.elb.amazonaws.com/api/v1/user/searchUser/${user?.username}`);
        if (response.data) {
          setUserDataFound(true);
          fetchRandomQuote(response.data.content.field); // Fetch random quote when user data is found
        } else {
          setUserDataFound(false);
        }
      } catch (error) {
        console.error('Error checking user data:', error.message);
      }
    }

    if (user && !userDataFound) {
      checkUserData();
    }
  }, [user, userDataFound, formData.field]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setButtonClicked(true);
    
    try {
      const response = await axios.post('http://a91987fa1ecfd4e7789588d72281d2e5-2098057441.us-east-1.elb.amazonaws.com/api/v1/user/saveUser', {
        userName: user.username,
        name: formData.name,
        userAdress: formData.address,
        userMNumber: formData.mobileNumber,
        field: formData.field 
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 200) {
        setAlertMessage('User saved successfully!');
        setFormData({
          name: '',
          address: '',
          mobileNumber: '',
          field: ''
        }); // Clear form fields after successful submission
        setFormVisible(false); // Hide the form
        refreshPage(); // Refresh the page after successful submission
      } else {
        console.error('User saved successfully Response:', response);
        setAlertMessage('User saved successfully');
      }
    } catch (error) {
      console.error('Error:', error.message, error.response);
      setAlertMessage('Error saving user');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  
  const refreshPage = () => {
    window.location.reload();
  };

  const fetchRandomQuote = async (field) => {
    try {
      const response = await axios.get(`http://a4373c5c4759d42218dbe9b479d40cb9-514636231.us-east-1.elb.amazonaws.com/api/v1/quote/getAllQuotes`);
      if (response.data.code === '00') {
        // Filter quotes by the selected field
        const quotesByField = response.data.content.filter(quote => quote.field === field);
        if (quotesByField.length > 0) {
          // Shuffle the array of quotes
          shuffleArray(quotesByField);
          // Select the first quote from the shuffled array
          const randomQuote = quotesByField[0].quote;
          setQuote(randomQuote);
        } else {
          console.error('No quotes found for the selected field:', field);
        }
      } else {
        console.error('Failed to fetch random quote:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching random quote:', error.message);
    }
  };
  
  // Function to shuffle an array (Fisher-Yates shuffle algorithm)
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };
  
  return (
    <Authenticator>
      {({ signOut, user }) => {
        setUser(user);
        const handleSignOut = () => {
          signOut();
          refreshPage(); // Refresh the page upon logout
        };
        return (
          <div>
            <TopBar>
              User Management System
              {user && (
                <span style={{ float: 'right' }}>
                  {user.signInDetails.loginId}
                  <button onClick={handleSignOut} style={{ marginLeft: '10px' }}>Sign out</button>
                </span>
              )}
            </TopBar>
            <MainContainer>
            <Greeting>
                {(() => {
                  const time = new Date().getHours();
                  if (time < 12) {
                    return 'Good morning';
                  } else if (time < 18) {
                    return 'Good afternoon';
                  } else {
                    return 'Good evening';
                  }
                })()}, {user && user.signInDetails.loginId}
              </Greeting>
            <QuoteContainer>
              {userDataFound ? (
                <Quote>{quote}</Quote>
              ) : (
                <FormContainer style={{ display: formVisible ? 'block' : 'none' }}>
                  {alertMessage && <Alert type={alertMessage.startsWith('User saved successfully') ? 'success' : 'error'}>{alertMessage}</Alert>}
                  <h2>Fill out the form</h2>
                  <form onSubmit={handleSubmit}>
                    <FormGroup>
                      <Label htmlFor="name">Name:</Label>
                      <Input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </FormGroup>
  
                    <FormGroup>
                      <Label htmlFor="address">Address:</Label>
                      <Input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                      />
                    </FormGroup>
  
                    <FormGroup>
                      <Label htmlFor="mobileNumber">Mobile Number:</Label>
                      <Input
                        type="tel"
                        id="mobileNumber"
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        onChange={handleChange}
                        required
                      />
                    </FormGroup>
  
                    <FormGroup>
                      <Label htmlFor="field">Field:</Label>
                      <Select
                        id="field"
                        name="field"
                        value={formData.field}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Field</option>
                        {fields.map(field => (
                          <option key={field.id} value={field.field}>{field.field}</option>
                        ))}
                      </Select>
                    </FormGroup>
  
                    <Button type="submit" disabled={isSubmitting} clicked={buttonClicked}>Submit</Button>
                  </form>
                </FormContainer>
              )}
            </QuoteContainer>
          </MainContainer>
          </div>
          
        );
      }}
    </Authenticator>
  );
}

export default App;
