import React, { PureComponent as Component } from 'react';
import SeatMap from './SeatMap';
import FlightInfo from './FlightInfo';
import UserInfo from './UserInfo';
import ReservationStatus from './ReservationStatus';

import axios from 'axios';


class SubmitComplex extends Component {
  render() {
    return (
      <div>
        <button onClick={ this.props.onClick }>Book</button>
      </div>
    );
  }
}




// PARENT

class ReservationForm extends Component {
  saveSelected = (s) => {
    this.setState({
      selectedSeat: s
    });
    // console.log(s);
  }

  constructor() {
    super();
    this.state = {
      flight: {},
      user: {},
      takenSeats: [],
      selectedSeat: "",
      status: ""
    };
    const fetchFlight = () => {
      // console.log('Updating live data...');
      axios.get(`http://burningairlinesdb.herokuapp.com/flights/${ 1 }.json`)   // TODO update when component is integrated
        .then( results => this.setState({ flight: results.data }) )
        .then( () => {
          const reservations = this.state.flight.reservations.slice();
          const takenSeats = reservations.map(r => r.seat);
          // console.log('Taken seats on this flight: ', takenSeats);
          this.setState({ takenSeats });
        });
      setTimeout( fetchFlight, 4000 );
    }
    const fetchUser = () => {
      axios.get(`http://burningairlinesdb.herokuapp.com/users/${ 1 }.json`)   // TODO update when component is integrated
        .then( results => this.setState({ user: results.data }) );
      setTimeout( fetchUser, 4000 );
    }
    fetchFlight();
    fetchUser();
  }


  addNewRes = () => {
    axios.post(
      'http://burningairlinesdb.herokuapp.com/reservations.json',
      {
        reservation: {
          seat: this.state.selectedSeat,
          flight_id: this.state.flight.id,
          user_id: this.state.user.id
        }
      }
    )
    .then(response => {
      // console.log( response.statusText === "Created" ? "Reservation complete. Thank you for choosing Burning." : "" );
      this.setState({
        status: response.statusText === "Created" ? "Reservation complete. Thank you for choosing Burning." : ""
      });
    })
    .catch(error => {
      // console.log( error.message === "Request failed with status code 422" ? "Sorry, that seat is unavailable." : "" );
      this.setState({
        status: error.message === "Request failed with status code 422" ? "Sorry, that seat is unavailable. Please choose an available seat or call 1800 BURNING for assistance." : ""
      });
    })


  }


  render() {
    return (
      <div>
        <h1>Make a reservation</h1>
        <UserInfo userName={ this.state.user.name } />
        <FlightInfo flightNumber={ this.state.flight.number } flightId={ this.state.flight.id } />
        <SeatMap rows={ this.state.flight.rows } cols={ this.state.flight.cols } takenSeats={ this.state.takenSeats } passSeat={ this.saveSelected } />
        <SubmitComplex onClick={ this.addNewRes } />
        <ReservationStatus status={ this.state.status } />
      </div>
    );
  }
}


export default ReservationForm;
