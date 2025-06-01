import { useState, useEffect } from "react";
import React from 'react';
import {Button, Calendar, CalendarCell, CalendarGrid, DateInput, DatePicker, DateSegment, Dialog, Group, Heading, Label} from 'react-aria-components';
import { CalendarDate, parseDate } from '@internationalized/date';
//Does not invalidate "+" sign
function App() {
  const [adultCount, setAdultCount] = useState('');
  const [childCount, setChildCount] = useState('');
  const [specifyEvent, setSpecifyEvent] = useState('');
  const integerRegex = /^[0-9]\d*$/;
  const specialChar = /[!@#$%^&*(),.?":{}|+<>]/g;
  const [data, setData] = useState([]);
  const [month, setMonth] = useState();
  const [date, setDate] = useState();
  const [year, setYear] = useState();
  const [events, setEvents] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [eventsChecked, setEventsChecked] = useState([]);
  const [newEvents, setNewEvents] = useState([]);
  const [newEventsChecked, setNewEventsChecked] = useState([]);
  const [addingNewEvent, setAddingNewEvent] = useState(false);
  const [editName, setEditName] = useState(false);
  const [eventToChange, setEventToChange] = useState('');
  const [defaultDate, setDefaultDate] = useState(''); 
  const [submitted, setSubmitted] = useState(false);
  const handleCheckboxChange = (id, name) => {
    console.log('Checkbox: ', id, 'Name: ', name);
    let e = eventsChecked.indexOf(id);
    console.log('Index of event:', e);
    if(e !== -1) {
      eventsChecked.splice(e, 1);
      setEventsChecked(eventsChecked);
      return;
    }
    setEventsChecked([...eventsChecked, id]);
  }
  const handleCheckboxChangeNewEvents = (name) => {
    console.log('Checkbox for new event:', name);
    let e = newEventsChecked.indexOf(name);
    console.log('Index of event:', e);
    if(e !== -1) {
      newEventsChecked.splice(e, 1);
      setNewEventsChecked(newEventsChecked);
      return;
    }
    setNewEventsChecked([...newEventsChecked, name]);
  }
  /*const getDate = () => {
    const todayTemp = new Date();
    console.log('Today\'s date:', todayTemp);
    const today = new CalendarDate(todayTemp.getFullYear(), todayTemp.getMonth()+1, todayTemp.getDate());
    //const today = new CalendarDate();
    setMonth(today.month); // CalendarDate months are 0-indexed, so we add 1
    //setMonth(today.getMonth() + 1);
    setYear(today.year);
    setDate(today.day);
    setDefaultDate(today.toString());
    console.log('Today\'s defualt date:', defaultDate);
    //setYear(today.getFullYear());
    //setDate(today.getDate());
    console.log('Today\'s date:', today.month);
  };*/
  const checkNumber = (value, countType) => {
    if (countType === 'setAdultCount') {
      setAdultCount(value);
    } 
    else if (countType === 'setChildCount') {
      setChildCount(value);
    }
    try {
      if (value !== '' && (!integerRegex.test(value) || specialChar.test(value))) {
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
  const writeNewAttendance = async () => {
    try {
        const response = await fetch('/data-api/rest/Attendance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-MS-API-ROLE' : 'admin',
            },
            body: JSON.stringify({
              service_date: `${year}-${month}-${date}`,
              adult_count: parseInt(adultCount),
              child_count: parseInt(childCount),
              total: parseInt(adultCount) + parseInt(childCount),
            })
        });
        const data = await response.json();
        if (response.ok) {
          console.log('Data posted successfully:', data);
          return true;
            //setShowModal(false);
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
      return false;
        //console.error(error);
    }
  }
  const writeEvent = async () => {
    //console.log('Writing event:', event);
    if (eventsChecked.length === 0 && newEventsChecked.length === 0) {
      eventsChecked.push(1);
    }
    eventsChecked.map(async (event) => {
    try {
      const response = await fetch('/data-api/rest/Attendance_Event', {  
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'X-MS-API-ROLE' : 'admin',
          },
          body: JSON.stringify({
            service_date: `${year}-${month}-${date}`,
            event_id: event
          })
      })  
      const data = await response.json();
      if (response.ok) {
        console.log('Event data posted successfully:', data);
      } else {
        throw new Error(data.message);
      }
    }
      catch (error) {
        console.error('Error posting event data:', error);
      }
    })
    //Get the new event 
    const responseFetch = await fetch('/data-api/rest/Event');
    if (!responseFetch.ok) {
      throw new Error(responseFetch.statusText);
    }
    const dataFetch = await responseFetch.json();
    const eventNames = dataFetch.value.map(event => event.id);
    //remove the first element ('regular service') from the array to display
    eventNames.splice(0, 1);
    const oldEvents = events.map(event => event.id); 
    console.log('new events in database fetched:', eventNames);
    let res = eventNames.filter((e) => !oldEvents.includes(e));
    console.log('old events in database:', oldEvents);
    console.log('new events in database fetched:', eventNames);
    console.log('New events in database to write to event_attendance:', res);
    
    if (res.length !== 0) {
      res.map(async (event) => {
        try {
          const response = await fetch('/data-api/rest/Attendance_Event', {  
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'X-MS-API-ROLE' : 'admin',
              },
              body: JSON.stringify({
                service_date: `${year}-${month}-${date}`,
                event_id: event
              })
          })  
          const data = await response.json();
          if (response.ok) {
            console.log('Event data posted successfully:', data);
            //return true; // Return true to indicate success
          } else {
            throw new Error(data.message);
          }
        }
        catch (error) {
          console.error('Error posting event data:', error);
          //return false; // Return false to indicate failure
        }
      })
  }
  }
  const writeNewEvent = async () => {
    console.log('Writing new events:', newEventsChecked);
    if (newEventsChecked.length === 0) {
      return true; // No new events to write
    }
    try { // Added try block for overall error handling in writeNewEvent
      await Promise.all(newEventsChecked.map(async (event) => { // Wait for all these to complete
        console.log('trying to post new event:', event);
        try {
          const response = await fetch('/data-api/rest/Event', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'X-MS-API-ROLE' : 'admin',
              },
              body: JSON.stringify({
                event_name: event,
              })
          })
          const data = await response.json();
          if (response.ok) {
            console.log('New event data posted successfully:', data);
          } else {
            throw new Error(data.message || `Failed to post event ${event}`);
          }
        } catch (error) {
          console.error('Error posting individual new event data:', event, error);
          throw error; // Re-throw to be caught by Promise.all
        }
      }));
      console.log("All new events processed by writeNewEvent.");
      return true; // Return true to indicate success
    } catch (error) {
      console.error("Error posting one or more new events in writeNewEvent:", error);
      return false;
      // Potentially alert the user or set an error state
    }
  }
  const handleSubmission = async (event) => {
    event.preventDefault();
    console.log(month, date, year);
    console.log('Events in database checked:', eventsChecked);
    console.log('New events checked not pushed to database yet:', newEvents);
    console.log('Writing new events:', newEventsChecked);
    //check for empty fields
    if (adultCount !== '' && childCount !== '') {
      if (await writeNewAttendance()) {
        if (await writeNewEvent()) {
          await writeEvent();
        }
        setSubmitted(true);
      }
      else {
        alert('Error writing new attendance data. Please try again.');
        return;
      }
    }
    else {
      alert('Please fill in all required fields: Date, Adult Count, Child Count!');
      return;
    }
    //console.log('Form submitted');
  }
  const fetchData = async () => {
        try {
            const response = await fetch('/data-api/rest/Attendance');
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            const data = await response.json();
            console.log('Data fetched:', data.value);
            setData(data.value);
        } catch (error) {
          console.log('Error fetching data:', error);
        }
  };
  const fetchEvents = async (type) => {
    try {
      const response = await fetch('/data-api/rest/Event');
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const data = await response.json();
      // Assuming data.value is an array of event objects
      // and each object has an event_name property.
      if (data.value && Array.isArray(data.value)) {
        //const eventNames = data.value.map(event => event.event_name);
        const eventNames = data.value.map(event => event); 
        //Remove the first element ('regular service') from the array to display
        eventNames.splice(0, 1);
        console.log('Events fetched:', eventNames);
        if (type === 'init') {
          setEvents(eventNames);
        }
        else {
          console.log("not init");
          /*useEffect(() => {
            setNewEventDatabase(eventNames);
          }, []);*/
        }
      } else {
        console.log('Events data is not in the expected format:', data.value);
        setEvents([]); // Set to empty array or handle error appropriately
      }
    } catch (error) {
      console.log('Error fetching events:', error);
      setEvents([]); // Set to empty array on error
    }
  };
  const handleShowCalendar = (event) => {
    event.preventDefault();
    setShowCalendar(!showCalendar);
  }
  const addNewEvent = (event) => {
    console.log('Adding new event:', event.target.value);
    setAddingNewEvent(true);
  }
  const handleNewEventSubmission = (event) => {
    setNewEvents([...newEvents, event]);
    setNewEventsChecked([...newEventsChecked, event]);
    setAddingNewEvent(false);
    console.log('New event added:', event);
    console.log('New events:', newEvents);
    console.log('New events checked:', newEventsChecked);
    setSpecifyEvent(''); // Clear the input field after submission
  } 
  const settingEventName = (event) => {
    setSpecifyEvent(event.target.value);
  }
  const editEventName = (event) => {
    // This function is intended to edit the name of an event
    setEditName(true);
    setEventToChange(event);
  }
  const handleChangeName = () => {
    // This function is intended to handle the change of an event 
    const index = newEvents.findIndex(eventName => eventName === eventToChange);
    console.log('Index of event to change:', index);
    newEvents[index] = specifyEvent;
    setNewEvents([...newEvents]);
    //Changing name of checkbox in Checked
    const indexChecked = newEventsChecked.findIndex(eventName => eventName === eventToChange);
    console.log('Index of event to change:', indexChecked);
    newEventsChecked[indexChecked] = specifyEvent;
    setNewEventsChecked([...newEventsChecked]);

    console.log('Event name changed to:', newEvents);
    setEditName(false); // Close the dialog after saving
    setSpecifyEvent(''); // Clear the input field after saving
    setEventToChange(''); // Clear the event to change
  }
  //const [placeholderDate, setPlaceholderDate] = useState(null);
  useEffect(() => {
    //getDate(); // Ensure month, date, year are set
    const todayTemp = new Date();
    console.log('Today\'s date:', todayTemp);
    const today = new CalendarDate(todayTemp.getFullYear(), todayTemp.getMonth()+1, todayTemp.getDate());
    //const today = new CalendarDate();
    setMonth(today.month); // CalendarDate months are 0-indexed, so we add 1
    //setMonth(today.getMonth() + 1);
    setYear(today.year);
    setDate(today.day);
    setDefaultDate(today.toString());
    fetchEvents('init');
    //console.log('Fetching data from date...');
  }, []); // Fetch events on mount and when year, month, or date changes
  // useEffect(() => {
  //   // Update placeholderDate whenever year, month, or date changes
  //   console.log('Year:', year, 'Month:', month, 'Date:', date);
  //   let temp = new CalendarDate(year, month, date);//
  //   if (temp.toString() !== "0NaN-NaN-NaN") {
  //     setDefaultDate(temp.toString());
  //   }
  //   console.log('Updated default date:', defaultDate);
  //   /*if (placeholderDate !== '0NaN-NaN-NaN') {
  //     console.log('Updated placeholder date2:', parseDate(placeholderDate));
  //   }*/
  //   //console.log(parseDate(`${placeholderDate.year}-${placeholderDate.month() + 1}-${placeholderDate.day()}`)); 
  // }, [year, month, date]);

  //let temp = '2025-01-01';
  //let temp = `${year}-${month}-${date}`;
  // if (year && month && date) {
  //   placeholderDate = new CalendarDate(year, month, date);
  // }
  return (
    !submitted ? (
      <div className="App">
      <h1>CBM Attendance</h1>
      <form>
        <DatePicker
          //defaultValue={parseDate('0000-00-00')} // Set the default value for the DatePicker
          defaultValue={defaultDate !== '' ? parseDate(defaultDate) : null} // Set the default value for the DatePicker
          onChange={(e) => {
            if (e !== null) {
              setMonth(e.month);
              setDate(e.day); 
              setYear(e.year);
            }
          }}
        >
          <Label>Date</Label>
          <Group>
            <DateInput className="date-input"
              //defaultValue={placeholderDate} // Set the default value for the DateInput
              //defaultText={`${month}/${date}/${year}`} // Set the default visible value for the DateInput
              >
              {(segment) => <DateSegment segment={segment}
                // {...console.log('Segment:', segment)}
                //segmentPlaceholder={`${month}/${date}/${year}`} // Set placeholder for date segment
                onChange={(e) => {
                  console.log('Date segment changed:', e.target.value);
                }}/>
              }
            </DateInput>
            <Button onClick={e => handleShowCalendar(e)}>▼</Button>
          </Group>
          {showCalendar? 
            <Dialog>
              <Calendar>
                <header>
                  <Button slot="previous">◀</Button>
                  <Heading />
                  <Button slot="next">▶</Button>
                </header>
                <CalendarGrid>
                  {(date) => <CalendarCell date={date} />}
                </CalendarGrid>
              </Calendar>
            </Dialog>
          : null}
        </DatePicker>
        <br></br>
        <br></br>
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
        Events
        <br></br>
        
        {events.map((event) => (
          <label key={event.id}>
            <input type="checkbox" name="event" value={event.event_name}
            onChange={(e) => handleCheckboxChange(event.id, event.event_name)} // Handle checkbox changes
            />
            {event.event_name}
          </label>
        ))}
        {console.log('New events:', newEvents)}
        {newEvents.length !== 0 ?
          newEvents.map((event) => (
            <label key={event}>
              <input type="checkbox" name="event" value={event} defaultChecked
              onChange={(e) => handleCheckboxChangeNewEvents(event)} // Handle checkbox changes
              />
              {event}
              <Button onPress={() => editEventName(event)}>Edit Name</Button>
            </label>
          ))
          : null 
        }
        {editName ? 
          <Dialog>
            <input type="text" name="editEvent" onChange={(value) => settingEventName(value)} value={specifyEvent} required ></input>
            <Button onPress={() => handleChangeName()}>Save</Button>
          </Dialog> : null
        }
        <Button onPress={(e) => {addNewEvent(e)}}>Add New Event</Button>
        {addingNewEvent? 
          <div>
          <Dialog> 
            <input type="text" name="newEvent" placeholder="New Event Name" onChange={(value) => settingEventName(value)} value={specifyEvent} required ></input>
            <Button onPress={() => handleNewEventSubmission(specifyEvent)}>Add</Button>
          </Dialog>
          </div>:null
        }
        <br></br>
        <br></br>
        <button type="submit" onClick={handleSubmission}>Submit</button>
      </form>
      <button id="get" onClick={fetchData}>Get</button>
      {data.map(entry => (
        <div key={entry.service_date + entry.adult_count + entry.child_count}>
          {`${entry.service_date} ${entry.adult_count} ${entry.child_count} ${entry.total}`}
        </div>
      ))}
    </div>
    ) : (
    <div className="App">
      <h1>CBM Attendance</h1>
      <p>Thank you for submitting your attendance!</p>
      <Button onPress={() => window.location.reload()}>Submit Another Attendance</Button>
    </div>
    )
  );
}
export default App;
