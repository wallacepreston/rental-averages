import React, { useState } from 'react';

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
  
  return <>
    <h2>Property Info Requested</h2>

    {
      bedrooms && accommodates && !editing
        ? <>
          <h3>{bedrooms} Bedrooms</h3>

          <button onClick={() => setEditing(true)}>Edit</button>
        </>
        : <>
          <form onSubmit={handleSubmit}>
            <label>
              Number of Bedrooms:
              <input type="text" name="bedrooms" value={requestedBedrooms} onChange={(e) => setRequestedBedrooms(e.target.value)} />
            </label>
            <label>
              Accommodates:
              <input type="text" name="accommodates" value={requestedAccommodates} onChange={(e) => setRequestedAccommodates(e.target.value)} />
            </label>
            <input type="submit" value="Submit" />
          </form>
        </>
        
    }
    
  </>
  
}