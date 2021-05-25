import logo from './logo.svg';
import './App.css';
import { useCallback, useEffect, useState } from 'react';

const seats = [{
  type: 'CLUB',
  price: 500,
  arrangements: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ] 
}, {
  type: 'EXECUTIVE',
  price: 300,
  arrangements: [
    [0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],
    [0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],
    [0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],
    [0,0,0,0,1,-1,-1,-1,1,1,-1,1,1,1,1],
    [1,1,1,1,-1,1,1,1,1,1,1,1,1,1,1],
    [1,1,-1,1,1,1,1,1,1,-1,1,1,1,1,1],
    [1,1,1,1,1,1,1,-1,1,1,1,1,1,1,1],
    [1,1,-1,-1,1,-1,1,1,1,1,1,1,1,1,1],
  ] 
}];


const SeatArrangements = ({seats}) => {

  const [seatCount, setSeatCount] = useState(0);

  const [hallLayout, setLayout] = useState({});

  const [bookedSeat, updateSelectedSeats] = useState({
    type: '',
    selectedSeats: [],
  });

  const handleSeatCount = useCallback((event) => {
    if (event.target.value <= 10) {
      setSeatCount(s => event.target.value);
    }
  }, []);

  const checkIfAllSeatsAreAvailable = (type, rowIdx, colIdx) => {
    const row = hallLayout[type].arrangements[rowIdx];
    const allPossibleCol = row.slice(colIdx, colIdx + Math.min(row.length, seatCount));
    return !allPossibleCol.find(item => item === -1);
  };

  const handleSeatBooking = useCallback((rowIndex, colIndex, type) => () => {
    if (!seatCount) {
      return;
    }

    const bookedLength = bookedSeat.selectedSeats.length;
    if (bookedLength < seatCount && (!bookedSeat.type || bookedSeat.type === type)) {
      let selectedSeats;
      updateSelectedSeats(s => {
        selectedSeats = [...s.selectedSeats];
        const alreadyPresentIndex = s.selectedSeats.findIndex((item) => item[0] === rowIndex && item[1] === colIndex);
        if (alreadyPresentIndex === -1) {
          if (checkIfAllSeatsAreAvailable(type, rowIndex, colIndex) && !bookedSeat.selectedSeats.length) {
            for(let i=0; i< seatCount; i++) {
              selectedSeats = [...selectedSeats, [rowIndex, colIndex+i]];
            } 
          } else {
            selectedSeats = [...selectedSeats, [rowIndex, colIndex]];
          }
        } else {
          selectedSeats.splice(alreadyPresentIndex, 1);
        }
        return {
          ...s,
          type,
          selectedSeats,
        }
      });
  
      setLayout(s => {
        const newArrangement = [...s[type].arrangements];
        if (checkIfAllSeatsAreAvailable(type, rowIndex, colIndex) && !bookedLength) {
          for(let i=0; i< seatCount; i++) {
            newArrangement[rowIndex][colIndex + i] = -2;
          } 
        } else {
          const alreadyPresentIndex = bookedSeat.selectedSeats.findIndex((item) => item[0] === rowIndex && item[1] === colIndex);
          newArrangement[rowIndex][colIndex] = alreadyPresentIndex === -1 ? -2 : 1;
        }

        return {
          ...s,
          [type] : {
            ...s[type],
            arrangements: newArrangement,
          }
        };
      });
    }
    // Clicking when max seat are selected
    if (bookedLength == seatCount) {
      updateSelectedSeats(s => {
        let firstSelectedSeat = [];
        firstSelectedSeat = s.selectedSeats[0];
        let selectedSeats = [...s.selectedSeats];
        selectedSeats.splice(0, 1);
        selectedSeats = [...selectedSeats, [rowIndex, colIndex]];
        return {
          ...s,
          type,
          selectedSeats,
        }
      });

      setLayout(s => {
        const firstSelectedSeat = bookedSeat.selectedSeats[0];
        const newArrangement = [...s[type].arrangements];
        const alreadyPresentIndex = bookedSeat.selectedSeats.findIndex((item) => item[0] === rowIndex && item[1] === colIndex);
        newArrangement[rowIndex][colIndex] = alreadyPresentIndex === -1 ? -2 : 1;
        newArrangement[firstSelectedSeat[0]][firstSelectedSeat[1]] = 1;
        return {
          ...s,
          [type] : {
            ...s[type],
            arrangements: newArrangement,
          }
        };
      });
    }
  }, [seatCount, bookedSeat]);

  useEffect(() => {
    const layout = seats.reduce((acc, item) => {
      acc[item.type] = {
        ...item,
      };
      return acc;
    }, {});
    setLayout(layout);
  }, []);

  const renderSeats = (row, rowIndex, type) => {
    return row.map((seat, i) => (
      <div className={`seat ${seat ? (seat < 0 ? (seat === -2 ? 'user-booked' :  'booked') : 'allowed') : 'not-allowed'}`}
        onClick={handleSeatBooking(rowIndex, i, type)}
      >
        {i+1}
      </div>
    ))
  };

  const renderSeatArrangements = (layout, type) => {
    return layout.map((row, i) => (
      <div className='row' data-id={i}>
        {renderSeats(row, i, type)}
      </div>
    ));
  }

  const renderInput = () => (
    <input type='number' onChange={handleSeatCount} />
  )
  const renderLayout = () => {
    return seats.map((layout => (
      <div className='layout'>
        <div className='detail'>{layout.type} - {layout.price}</div>
        {hallLayout[layout.type] ? renderSeatArrangements(hallLayout[layout.type].arrangements, layout.type) : ''}
      </div>
    )))
  };



  return (
    <>
      {renderInput()}
      {renderLayout()}
    </>
  )
};

function App() {
  return (
    <div className="App">
      <h1>Seat Booking</h1>
      <SeatArrangements seats={seats}/>
    </div>
  );
}

export default App;
