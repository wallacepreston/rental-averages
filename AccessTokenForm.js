import React, { useState } from 'react';
import { baseURL } from './util';

import { Modal, Input, Alert } from 'antd';

export const AccessTokenForm = ({setAccessToken, confirmValidToken}) => {
  const [accessTokenInput, setAccessTokenInput] = useState('');
  const [error, setError] = useState('');

  const handleOk = async () => {
    const data = await confirmValidToken(accessTokenInput);
    if(data?.num_items) {
      localStorage.setItem('accessToken', accessTokenInput);
      setAccessToken(accessTokenInput);
    } else {
      setError('Invalid access token');
    }
  }
  
  // TODO - make a login modal with Auth0 to connect AirDNA data
  return <>
    <form onSubmit={(e) => e.preventDefault()}>
      <Modal
        title="Authenticate"
        visible={true}
        onOk={handleOk}
        cancelButtonProps={{ style: { display: 'none' } }}
        closable={false}
      >
        <label>
          {error && <Alert message={error} type="error" />}
          This tool is only available with a paid AirDNA account.  Get your access token by <a href="https://www.airdna.co/vacation-rental-data/app/login" target="_blank">visiting airDNA</a> and opening the network tab to retrieve your token from the response for '<code>refresh</code>'. Then please enter your access token below.
          <br/>
          <Input style={{width: '75%'}} type="text" value={accessTokenInput} placeholder="paste access token here" onChange={(e) => setAccessTokenInput(e.target.value)} />
        </label>
      </Modal>
    </form>
  </>
  
}