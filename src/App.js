
import './App.css';
import {useEffect, useState} from 'react';
import { MenuItem, FormControl, Select, Card, CardContent } from '@material-ui/core';
import Infobox from './Infobox';
import Map from "./Map";
import Table from './Table';
import {sortedData, prettyPrintStat} from './Utils';
import LineGraph from './LineGraph';
import "leaflet/dist/leaflet.css"

function App() {

  const [countries, setCountries]= useState([]);
  const [country, setCountry]= useState("WorldWide");
  const [countryInfo, setCountryInfo]= useState("worldwide");
  const [table, setTabledata]= useState([]);
  const [casesType, setCasesType] = useState("cases");
  const [mapCenter, setMapCenter]= useState({ lat: 34.88746, lng: -48.4796});
  const [mapZoom, setMapZoom]= useState(3);
  const [mapCountries, setMapCountries]= useState([]);
  const [map, setMap]= useState(null);

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
    .then(response => response.json())
    .then((data) => {
      setCountryInfo(data)
    });
    
  },[])


  useEffect(() => {
    fetchAPI();
    
  }, [])

  const onCountryChange= async(event) => {
    const countryCode= event.target.value;
    

    const url= 
              countryCode === "worldwide" ? "https://disease.sh/v3/covid-19/all": 
              `https://disease.sh/v3/covid-19/countries/${countryCode}`;
            
    await fetch(url).then(response => response.json())
    .then(data => {
      console.log(data);
      setCountryInfo(data);
      setCountry(countryCode);
      


      setMapCenter(countryCode ==="worldwide" ? {lat: 34.80746, lng: -40.4796} : [data.countryInfo.lat, data.countryInfo.long]);
      setMapZoom(countryCode === "worldwide" ? 2.5 : 4);
    })

    
  };

  

  const fetchAPI = async() => {
    const response= await fetch("https://disease.sh/v3/covid-19/countries");
    const respData= await response.json();
    const reqData= respData.map((data) => (
      {
        name: data.country,
        value: data.countryInfo.iso2,
        id: data.id
      }
    ))
    
    const sortData= sortedData(respData);
    setMapCountries(respData);
    setTabledata(sortData);
    setCountries(reqData);
  }

  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>COVID 19 TRACKER</h1>
          <FormControl className="app__dropdown">
            <Select variant="outlined" onChange={onCountryChange} value={country}>
              <MenuItem value="worldwide">WorldWide</MenuItem>
              {
                countries.map((country) => (
                  <MenuItem  key={country.id} value={country.value}>{country.name}</MenuItem>
                ))
              }
            </Select>
          </FormControl>
        </div>


          <div className="app__status">
              <Infobox isRed active={casesType==="cases"} onClick={e=> setCasesType("cases")} title="Coronavirus Cases" cases={prettyPrintStat(countryInfo.todayCases)} total={prettyPrintStat(countryInfo.cases)}/>

              <Infobox active={casesType==="recovered"} onClick={e=> setCasesType("recovered")} title="Recovered Cases" cases={prettyPrintStat(countryInfo.todayRecovered)} total={prettyPrintStat(countryInfo.recovered)}/>

              <Infobox isRed active={casesType==="deaths"} onClick={e=> setCasesType("deaths")} title="Deaths" cases={prettyPrintStat(countryInfo.todayDeaths)} total={prettyPrintStat(countryInfo.deaths)}/>
          </div>
            
          <Map casesType={casesType} countries={mapCountries} center={mapCenter} zoom={mapZoom} whenCreated={setMap} maxZoom={8}/>
          
      </div>

      <Card className="app__right">
          <CardContent>
              <h3>Live cases by Country</h3>
              <Table countries={table}/>
              <h3 className="new__cases">WorldWide new {casesType}</h3>
              <LineGraph className="app__graph" casesType={casesType}/>
          </CardContent>
      </Card>
    </div>
  );
}

export default App;
