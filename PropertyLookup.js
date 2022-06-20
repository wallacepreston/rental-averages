import React, { useState } from 'react';
import { baseURL } from './util';

export const PropertyLookup = ({setCityId, accessToken}) => {
  const [city, setCity] = useState('');
  const [cityName, setCityName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // fetch
    const response = await fetch(`${baseURL}/search?access_token=${accessToken}&term=${city}`);
    const data = await response.json();
    const foundData = data?.items[0]

    const foundCity = foundData?.city
    if(foundCity) {
      setCityId(foundCity.id);
      setCityName(foundData.name);
    }
  }
  
  return <>
    <h2>City Lookup</h2>
    <form onSubmit={handleSubmit}>
      <label>
        City:
        <input type="text" value={city} onChange={(e) => setCity(e.target.value)} />
      </label>
      <input type="submit" value="Submit" />
    </form>
    {
      cityName && <>
        <h3>{cityName}</h3>
      </>
    }
  </>
  
}