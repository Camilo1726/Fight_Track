import React, { useState, useMemo, useEffect} from "react";
import "./FlightSearch.css";
import { useTable, useSortBy } from 'react-table'; //interactive table to display the search results / click on a row to view flight details
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 


const FlightSearch = () => {
  const [flights, setFlights] = useState([]);
  const [statuses] = useState(['On Time', 'Delayed', 'Cancelled', 'Pending', 'Rescheduled', 'Boarding', 'Gate Closed', 'In Flight', 'Diverted', 'Landed', 'Arrived']);
  const [searchQuery, setSearchQuery] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [arrivalDate, setArrivalDate] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [status, setStatus] = useState('');
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false); // track if search has been performed

  const navigate = useNavigate();
  const data = useMemo(() => filteredFlights, [filteredFlights]);

  // Fetch flights data from the backend
  const fetchFlights = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/flights');
      setFlights(response.data);
    } catch (error) {
      console.error('Error fetching flights:', error);
    }
  };

  // Fetch flights data from the backend
  useEffect(() => {
      fetchFlights();
    }, []);
  

  //Method to format the dates to display in the table withouth the time
  const formatDate = (dateString) => {
    return dateString.split('T')[0];
  };  

  // Define the columns for the table
  const columns = useMemo(
    () => [
      {
        Header: 'Flight Number',
        accessor: 'flightNumber'
      },
      {
        Header: 'Origin',
        accessor: 'origin'
      },
      {
        Header: 'Destination',
        accessor: 'destination'
      },
      {
        Header: 'Departure Date',
        accessor: 'departureDate',
        Cell: ({value}) => formatDate(value), // formaDate to display the date without the time
      },
      {
        Header: 'Departure Time',
        accessor: 'departureTime'
      },
      {
        Header: 'Arrival Date',
        accessor: 'arrivalDate',
        Cell: ({value}) => formatDate(value), // formaDate to display the date without the time
      },
      {
        Header: 'Arrival Time',
        accessor: 'arrivalTime'
      },
      {
        Header: 'Status',
        accessor: 'status'
      },
    ],
    []
  );

  // Use the useTable hook to create the table instance
  const tableInstance = useTable({ columns, data: filteredFlights }, useSortBy);

  // Destructure the table instance for easier access
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = tableInstance;

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetchFlights(); // Fetch and update flights data with the latest data from the backend
    
    const lowerCaseQuery = searchQuery.toLowerCase();
    const results = flights.filter(flight => {
      return (
        flight.flightNumber.toLowerCase().includes(lowerCaseQuery) ||
        flight.origin.toLowerCase().includes(lowerCaseQuery) ||
        flight.destination.toLowerCase().includes(lowerCaseQuery)
      ) && (
        flight.departureDate.includes(departureDate) &&
        flight.departureTime.includes(departureTime) &&
        flight.arrivalDate.includes(arrivalDate) &&
        flight.arrivalTime.includes(arrivalTime) &&
        (!status || flight.status === status)
      );
    });
    
    setFilteredFlights(results);
    setSearchPerformed(true); // Now indicates that the search has been performed after updating the data and applying filters
  };
    

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setDepartureDate('');
    setDepartureTime('');
    setArrivalDate('');
    setArrivalTime('');
    setStatus('');
  };



  return (

    <div className="flight-search-container">
       <head>
        <title>Flight Search</title>
      </head>
      <div className="time">
      <iframe src="https://free.timeanddate.com/clock/i9bebzvt/n250/tct/pct/ahl/avt/ftb/tt0/tw1/ta1" frameborder="0" width="301" height="19" allowtransparency="true"></iframe>
      </div>
      <h1>Discover Your Journey: Find Your Flights</h1>
      <hr />
      <form onSubmit={handleSubmit} className="search-form">
        <div className="field-container">
          <label htmlFor="searchQuery">Search</label>
          <input
            id="searchQuery"
            type="text"
            placeholder="Search by Flight Number, Origin, or Destination"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="field-container">
          <label htmlFor="departureDate">Departure Date</label>
          <input
            id="departureDate"
            type="date"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
          />
        </div>

        <div className="field-container">
          <label htmlFor="departureTime">Departure Time</label>
          <input
            id="departureTime"
            type="time"
            value={departureTime}
            onChange={(e) => setDepartureTime(e.target.value)}
          />
        </div>

        <div className="field-container">
          <label htmlFor="arrivalDate">Arrival Date</label>
          <input
            id="arrivalDate"
            type="date"
            value={arrivalDate}
            onChange={(e) => setArrivalDate(e.target.value)}
          />
        </div>

        <div className="field-container">
          <label htmlFor="arrivalTime">Arrival Time</label>
          <input
            id="arrivalTime"
            type="time"
            value={arrivalTime}
            onChange={(e) => setArrivalTime(e.target.value)}
          />
        </div>

        <div className="field-container">
          <label htmlFor="status">Status</label>
          <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Select Status</option>
            {statuses.map((status, index) => (
              <option key={index} value={status}>{status}</option>
            ))} 
          </select>
        </div>

        <div className="search-button-wrapper">
          <button type="submit">Search</button>
          <button type="button" onClick={clearFilters}>Clear Filters</button>

        </div>

            {/* Clear Filters button outside and after the form */}


      </form>

      {searchPerformed && (
      <div className="flights-list-container">
        <table {...getTableProps()}>
          <thead>
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                          <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                          {column.render('Header')}
                          {/* Add a sort direction indicator */}
                          <span>
                            {column.isSorted
                              ? column.isSortedDesc
                                ? ' ↓'
                                : ' ↑'
                              : ' ↑↓'}
                          </span>
                        </th>                
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map(row => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps({
                    onClick: () => navigate(`/flight-details/${row.original._id}`), // redirect to flight details page
                    style: { cursor: 'pointer' },
                  })}
                >
                  {row.cells.map(cell => {
                    return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )}


    </div>
  );
};

export default FlightSearch;
