import React, { useState } from 'react';
import { Input } from 'antd';

export const RequestedDataForm = ({bedrooms, setBedrooms, accommodates, setAccommodates}) => {
  const [editing, setEditing] = useState(false);
  const [requestedBedrooms, setRequestedBedrooms] = useState(bedrooms);
  const [requestedAccommodates, setRequestedAccommodates] = useState(accommodates);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBedrooms(requestedBedrooms);
    setAccommodates(requestedAccommodates);
    setEditing(false);
    // fetch
  }

  // converts for example (input: 3,4,5 output: 3-5)
  const rangeFromList = values => {
    const arr = values.split(',');
    if (arr.length === 1) {
      return values;
    } 
    return `${arr[0]} - ${arr[arr.length - 1]}`;
  }
  
  return <>
    <h2>Property Info Requested</h2>

    {
      bedrooms && accommodates && !editing
        ? <>
          <h3>{rangeFromList(bedrooms)} Bedrooms, Accommodates {rangeFromList(accommodates)}</h3>

          <button onClick={() => setEditing(true)}>Edit</button>
        </>
        : <>
          <form onSubmit={handleSubmit}>
          

            <label>
              Number of Bedrooms:
              <Input style={{ width: '50%' }} type="text" name="bedrooms" value={requestedBedrooms} onChange={(e) => setRequestedBedrooms(e.target.value)} />
            </label>
            <br></br>
            <label>
              Accommodates:
              <Input style={{ width: '50%' }} type="text" name="accommodates" value={requestedAccommodates} onChange={(e) => setRequestedAccommodates(e.target.value)} />
            </label>
            <br></br>
            <input type="submit" value="Submit" />
          </form>
        </>
        
    }
    
  </>
  
}