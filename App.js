import React, { useEffect, useState } from 'react';
// needed for compilation when using async/await without certain babel settings
import 'regenerator-runtime/runtime';
import { AccessTokenForm } from './AccessTokenForm';
import { PropertyLookup } from './PropertyLookup';

// TODO - make this a user input on form
const YEARS_OF_DATA = 3
const NUM_BEDROOMS = 4;

export function App() {

  // TODO - make this a user input on form
  const requestedDataPoints = [
    {
      urlName: 'revenue',
      dataName: 'revenue',
    },
    {
      urlName: 'occupancy',
      dataName: 'occupancy',
      type: 'percent',
    },
    {
      urlName: 'pricing',
      dataName: 'adr',
    }
  ]
  const [categories, setCategories] = useState({});
  const [accessToken, setAccessToken] = useState('');
  const [cityId, setCityId] = useState(0);

  // process array of monthly data for single data point
  const getAverages = ({data}) => {
    const totalAmts = data.reduce((acc, month) => {
      
      return {
        '25': acc['25'] + month['25'],
        '50': acc['50'] + month['50'],
        '75': acc['75'] + month['75'],
        '90': acc['90'] + month['90'],
      };
    }, { '25': 0, '50': 0, '75': 0, '90': 0 });
    const averageAmts = {
      '25': totalAmts['25'] / data.length,
      '50': totalAmts['50'] / data.length,
      '75': totalAmts['75'] / data.length,
      '90': totalAmts['90'] / data.length,
    };
    
    return averageAmts;
  }

  // computed value from state
  const percentiles = Object.entries(categories)
    .reduce((acc,[key, value]) => {
      const averages = getAverages({ data: categories[key] })
      return {
        ...acc,
        [key]: averages,
      }
    }, {});
  if (percentiles.adr && percentiles.occupancy) {
    percentiles.grossRent = {
      '25': percentiles.adr['25'] * percentiles.occupancy['25'] * 30 * 12,
      '50': percentiles.adr['50'] * percentiles.occupancy['50'] * 30 * 12,
      '75': percentiles.adr['75'] * percentiles.occupancy['75'] * 30 * 12,
      '90': percentiles.adr['90'] * percentiles.occupancy['90'] * 30 * 12,
    }
  }

  // start 3 years ago
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const startDate = new Date(currentYear - YEARS_OF_DATA, currentMonth, 1);
  const startMonth = startDate.getMonth() + 1;
  const startYear = startDate.getFullYear();
  const numberOfMonths = YEARS_OF_DATA * 12;

  const getURL = dataPointName => `https://api.airdna.co/v1/market/${dataPointName}/monthly?access_token=${accessToken}&start_month=${startMonth}&start_year=${startYear}&number_of_months=${numberOfMonths}&city_id=${cityId}&room_types=entire_place&accommodates=10&bedrooms=${NUM_BEDROOMS}`;

  const getDataPoints = async () => {
    // fetch all data points
    const responses = await Promise.all(requestedDataPoints.map(async ({urlName, dataName}) => {
      const response = await fetch(getURL(urlName));
      const {data} = await response.json();
      const resourceData = data[dataName];
      return resourceData.calendar_months.map(month => month.room_type.entire_place.bedrooms[NUM_BEDROOMS]);
    }));

    // process data
    const dataInObject = responses.reduce((acc, curr, idx) => {
      const key = requestedDataPoints[idx].dataName;
      acc[key] = curr;
      return acc;
    }, {});

    setCategories(dataInObject);
  }
  
  // transform averages into jsx
  const displayAmts = ({percentiles, type}) => Object.keys(percentiles).map((key, idx) => {
    let amt = percentiles[key];
    if(type === 'occupancy') {
      amt = percentiles[key] * 100;
    }
    const rounded = amt.toFixed(2);
    return <div key={idx}>
      <b>{key}<sup>th</sup>: </b>{ rounded }
    </div>
  });
  

  useEffect(() => {
    // todo - make this a user input on form, saved to localStorage
    const tokenFromStorage = localStorage.getItem('accessToken');
    if(tokenFromStorage) {
      setAccessToken(tokenFromStorage);
    }
  }, []);

  useEffect(() => {
    accessToken && cityId && getDataPoints();
  }, [accessToken, cityId]);

    return <>
      {
        !accessToken && <AccessTokenForm setAccessToken={setAccessToken} />
      }
      <PropertyLookup accessToken={accessToken} cityId={cityId} setCityId={setCityId} />
        {
          Object.keys(percentiles).map((key, idx) => <div key={idx}>
            <h2>{key}</h2>
            <div>{displayAmts({
              percentiles: percentiles[key],
              type: key
            })}</div>
          </div>)
        }
    </>
}
