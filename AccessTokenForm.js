import React, { useState } from 'react';
import { baseURL } from './util';

export const AccessTokenForm = ({setAccessToken}) => {
  const [accessTokenInput, setAccessTokenInput] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO - make an api call to confirm that this works before setting the token.
    localStorage.setItem('accessToken', accessTokenInput);
    setAccessToken(accessTokenInput);
  }
  
  // TODO - make a login modal with Auth0 to connect AirDNA data
  return <>
    <h2>Set your Access Token</h2>
    <form onSubmit={handleSubmit}>
      <label>
        Access Token:
        <input type="text" value={accessTokenInput} onChange={(e) => setAccessTokenInput(e.target.value)} />
      </label>
      <input type="submit" value="Submit" />
    </form>
  </>
  
}