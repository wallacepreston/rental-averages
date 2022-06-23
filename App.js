import React, { useEffect, useState } from 'react';
// needed for compilation when using async/await without certain babel settings
import 'regenerator-runtime/runtime';

import { Table, Layout } from 'antd';
const { Header, Footer, Content } = Layout;


import 'antd/dist/antd.css';

import { baseURL } from './util';
import { AccessTokenForm } from './AccessTokenForm';
import { PropertyLookup } from './PropertyLookup';
import { RequestedDataForm } from './RequestedDataForm';

const DEFAULT_BEDROOMS = '4';
const DEFAULT_ACCOMMODATES = '10';
// TODO - make this a user input on form
const YEARS_OF_DATA = 3
const CITY_ID = 59076;

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
  const [cityName, setCityName] = useState('');
  
  const [bedrooms, setBedrooms] = useState(DEFAULT_BEDROOMS);
  const [accommodates, setAccommodates] = useState(DEFAULT_ACCOMMODATES);

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

  // build request url
  const bedroomsList = '&bedrooms=' + bedrooms.split(',').map(bedrooms => bedrooms.trim()).join('&bedrooms=');
  const accommodatesList = '&accommodates=' + accommodates.split(',').map(accommodates => accommodates.trim()).join('&accommodates=');
  const getURL = dataPointName => `https://api.airdna.co/v1/market/${dataPointName}/monthly?access_token=${accessToken}&start_month=${startMonth}&start_year=${startYear}&number_of_months=${numberOfMonths}&city_id=${cityId}&room_types=entire_place&accommodates=10${bedroomsList}`;
  
  // make a superfluous api call to confirm that this works before setting the token.
  const confirmValidToken = async token => {
    const getURL = `${baseURL}search?access_token=${token}&term=manhattan`;
    const response = await fetch(getURL);
    return await response.json();
  }

  const getDataPoints = async () => {
    try {
      // fetch all data points
      const responses = await Promise.all(requestedDataPoints.map(async ({urlName, dataName}) => {
        const urlToFetch = getURL(urlName);
        
        const response = await fetch(urlToFetch);
        const {data} = await response.json();
        const resourceData = data[dataName];
        
        return resourceData.calendar_months.map(month => month.room_type.entire_place.bedrooms.all);
      }));

      // process data
      const dataInObject = responses.reduce((acc, curr, idx) => {
        const key = requestedDataPoints[idx].dataName;
        acc[key] = curr;
        return acc;
      }, {});
  
      setCategories(dataInObject);
    } catch (error) {
      console.error(error);
    }
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

  const dataSource = percentiles?.adr && [
    {
      key: '1',
      occupancy: (percentiles.occupancy['25'] * 100).toFixed(2),
      adr: percentiles.adr['25'].toFixed(2),
      grossRent: percentiles.grossRent['25'].toFixed(2),
      percentile: '25th',
    },
    {
      key: '2',
      occupancy: (percentiles.occupancy['50'] * 100).toFixed(2),
      adr: percentiles.adr['50'].toFixed(2),
      grossRent: percentiles.grossRent['50'].toFixed(2),
      percentile: '50th',
    },
    {
      key: '3',
      occupancy: (percentiles.occupancy['75'] * 100).toFixed(2),
      adr: percentiles.adr['75'].toFixed(2),
      grossRent: percentiles.grossRent['75'].toFixed(2),
      percentile: '75th',
    },
    {
      key: '4',
      occupancy: (percentiles.occupancy['90'] * 100).toFixed(2),
      adr: percentiles.adr['90'].toFixed(2),
      grossRent: percentiles.grossRent['90'].toFixed(2),
      percentile: '90th',
    },
  ];
  
  const columns = [
    {
      title: `${bedrooms} Bed, Sleeps ${accommodates}`,
      dataIndex: 'percentile',
      key: 'percentile',
    },
    {
      title: 'Average OCC',
      dataIndex: 'occupancy',
      key: 'occupancy',
    },
    {
      title: 'Average Rate',
      dataIndex: 'adr',
      key: 'adr',
    },
    {
      title: 'Projected Gross Revenue',
      dataIndex: 'grossRent',
      key: 'grossRent',
    },
  ];
  
  useEffect(() => {
    const autoLogin = async () => {
      const tokenFromStorage = localStorage.getItem('accessToken');
      if(tokenFromStorage) {
        const data = await confirmValidToken(tokenFromStorage);
        if(data?.num_items) {
          setAccessToken(tokenFromStorage);
        } else {
          localStorage.removeItem('accessToken');
        }
      }
    }
    autoLogin();
  }, []);

  useEffect(() => {
    accessToken && cityId && getDataPoints();
  }, [accessToken, cityId, bedrooms]);

    return <>

      {
        !accessToken && <AccessTokenForm accessToken={accessToken} setAccessToken={setAccessToken} confirmValidToken={confirmValidToken} />
        
      }
      <Layout className="layout" style={{ height: '100vh' }}>
        <Header>
          Rental Averages
        </Header>
        <Content style={{ padding: '50px'}}>
          <PropertyLookup accessToken={accessToken} cityId={cityId} setCityId={setCityId} cityName={cityName} setCityName={setCityName} />
          {
            cityId ? <RequestedDataForm bedrooms={bedrooms} setBedrooms={setBedrooms} accommodates={accommodates} setAccommodates={setAccommodates} /> : ''
          }
          <h2>Results for {cityName}</h2>
          {
            percentiles?.adr && <Table dataSource={dataSource} columns={columns} />
          }
        </Content>
        <Footer>
          &copy; Preston Wallace {new Date().getFullYear()} <a href="prestonwallace.com">prestonwallace.com</a>
        </Footer>
      </Layout>
        
    </>
}
