import React, { useEffect, useState } from 'react';
// needed for compilation when using async/await without certain babel settings
import 'regenerator-runtime/runtime';


// TODO - make this a user input on form
const YEARS_OF_DATA = 3
const { REACT_APP_ACCESS_TOKEN } = process.env;
const NUM_BEDROOMS = 4;
const CITY_ID = 59076;
// const CITY_ID = 58834 // 59076;

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

  // start 3 years ago
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const startDate = new Date(currentYear - YEARS_OF_DATA, currentMonth, 1);
  const startMonth = startDate.getMonth() + 1;
  const startYear = startDate.getFullYear();
  const numberOfMonths = YEARS_OF_DATA * 12;

  const getURL = dataPointName => `https://api.airdna.co/v1/market/${dataPointName}/monthly?access_token=${REACT_APP_ACCESS_TOKEN}&start_month=${startMonth}&start_year=${startYear}&number_of_months=${numberOfMonths}&city_id=${CITY_ID}&room_types=entire_place&accommodates=10&bedrooms=${NUM_BEDROOMS}`;
  

  const getDataPoints = async () => {
    // fetch all data points
    const responses = await Promise.all(requestedDataPoints.map(async ({urlName, dataName}) => {
      const response = await fetch(getURL(urlName));
      const {data} = await response.json();
      const resourceData = data[dataName];
      return resourceData.calendar_months;
    }));

    // process data
    const dataInObject = responses.reduce((acc, curr, idx) => {
      const key = requestedDataPoints[idx].dataName;
      acc[key] = curr;
      return acc;
    }, {});

    setCategories(dataInObject);
  }

  // process array of monthly data for single data point
  const getAverages = ({data, bedrooms}) => {
    const totalAmts = data.reduce((acc, month) => {
      const percentiles = month.room_type.entire_place.bedrooms[bedrooms];
      
      return {
        '25': acc['25'] + percentiles['25'],
        '50': acc['50'] + percentiles['50'],
        '75': acc['75'] + percentiles['75'],
        '90': acc['90'] + percentiles['90'],
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
  
  // transform averages into jsx
  const displayAmts = ({percentiles, type}) => Object.keys(percentiles).map((key, idx) => {
    const amt = type === 'occupancy' ? percentiles[key] * 100 : percentiles[key];
    const rounded = amt.toFixed(2);
    return <div key={idx}>
      <b>{key}<sup>th</sup>: </b>{ rounded }
    </div>
  });
  

  useEffect(() => {
    getDataPoints();
  }, []);

    return <>
        {
          Object.keys(categories).map((key, idx) => <div key={idx}>
            <h2>{key}</h2>
            <div>{displayAmts({
              percentiles: getAverages({ data: categories[key], bedrooms: NUM_BEDROOMS }),
              type: key
            })}</div>
          </div>)
        }
    </>
}
