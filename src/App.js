import { useState, useEffect} from "react";
import React from 'react';
//Does not invalidate "+" sign
function App() {
  const [adultCount, setAdultCount] = useState('');
  const [childCount, setChildCount] = useState('');
  const [communion, setCommunion] = useState(false);
  const [birthday, setBirthday] = useState(false);
  const [otherEvent, setOtherEvent] = useState(false);
  const [specifyEvent, setSpecifyEvent] = useState('');
  const integerRegex = /^[0-9]\d*$/;
  const specialChar = /[!@#$%^&*(),.?":{}|+<>]/g;
  const checkNumber = (value, countType) => {
    if (countType === 'setAdultCount') {
      setAdultCount(value);
    } 
    else {
      setChildCount(value);
    }
    try {
      if (value != '' && (!integerRegex.test(value) || specialChar.test(value))) {
        console.log('Value is not number:', value);
        throw new Error('Value is not number:', value);
      }
      else {
        console.log('Value is number:', value);
      }
    } catch (e) {
      alert('Please enter a valid number:', e.message);
      if (countType === 'setAdultCount') {
        setAdultCount('');
      } else {
        setChildCount('');
      }
    }
  }
  const handleSubmission = (event) => {
    event.preventDefault();
    console.log('Form submitted');
    console.log('Adult Count:', parseInt(adultCount));
    console.log('Child Count:', parseInt(childCount));
    console.log('Holy Communion:', communion);
    console.log('Birthday:', birthday);
    console.log('Other Event:', otherEvent);
  }
  return (
    <div className="App">
      <h1>CBM Attendance</h1>
      <form>
        <label>
          Adult Count
          <br></br>
          <input type="number" name="adult" min="0"
            onChange={(e) => checkNumber(e.target.value, 'setAdultCount')} value={adultCount}
          />
        </label>
        <br></br>
        <br></br>
        <label>
          Child Count
          <br></br>
          <input type="number" name="child" min="0"
            onChange={(e) => checkNumber(e.target.value, 'setChildCount')} value={childCount}
          />
        </label>
        <br></br>
        <br></br>
        <p>Events</p>
        <label>
          <input type="checkbox" name="event" value="yes"
          onChange ={(e) => setCommunion(!communion)}
          />
          Holy Communion
        </label>
        <label>
          <input type="checkbox" name="event" value="yes"
          onChange ={(e) => setBirthday(!otherEvent)}
          />
          Birthday
        </label>
        <label>
          <input type="checkbox" name="event" value="yes"
          onChange ={(e) => setOtherEvent(!otherEvent)} 
          />
          Other
        </label>
        {!otherEvent ? null :
          <input type="text" name="event" placeholder="Please specify"
            onChange={(e) => setSpecifyEvent(e.target.value)} value={specifyEvent}
          />
        }
        <br></br>
        <br></br>
        <button type="submit" onClick={handleSubmission}>Submit</button>
      </form>
    </div>
  );
}
/* Events 
Church Anniversary
Easter 
Christmas Celebration 
New Year 
Memorial 
Guest Speaker 
Mother's Day
Father's Day
*/
export default App;
