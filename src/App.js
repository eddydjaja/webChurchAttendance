import { useState, useEffect} from "react";
import React from 'react';
import {Button, Calendar, CalendarCell, CalendarGrid, DateInput, DatePicker, DateSegment, Dialog, Group, Heading, Label} from 'react-aria-components';
import Modal from 'react-bootstrap/Modal';
import 'bootstrap/dist/css/bootstrap.min.css';
import { CalendarDate, parseDate } from '@internationalized/date';
import { Edit } from 'react-feather';
import './App.css';
import Loading from './Loading.js'; // Import the Loading component
//Does not invalidate "+" sign
function App() {
  const [adultCount, setAdultCount] = useState('');
  const [childCount, setChildCount] = useState('');
  const [specifyEvent, setSpecifyEvent] = useState('');
  const integerRegex = /^[0-9]\d*$/;
  const specialChar = /[!@#$%^&*(),.?":{}|+<>]/g;
  // const [data, setData] = useState([]);
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
  const [loading , setLoading] = useState(true);
  const [duplicate, setDuplicate] = useState(false);
  const [override, setOverride] = useState(false);
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
        } else {
          throw new Error(data.message);
        }
    } catch (error) {
      return false;
    }
  }
  const checkAttendance = async () => {
    let formattedMonth = month;
    let formattedDate = date;
    if (month < 10) {
      formattedMonth = `0${month}`;
    }
    if (date < 10) {
      formattedDate = `0${date}`;
    }
  let dateQuery = `${year}-${formattedMonth}-${formattedDate}`;
  const endpoint = `/data-api/rest/Attendance/service_date`;
  try {
        const response = await fetch(`${endpoint}/${dateQuery}`);
        const data = await response.json();
        if (response.ok) {
            console.log('Attendance data:', data);
            if (data.value && data.value.length > 0) {
                // alert('Attendance for this date already exists. Please check the data.');
                setDuplicate(true);
                return false;
            } else {
                console.log('No attendance data found for this date.');
                return true;
            }
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
      return false;
    }
  }
  const writeEvent = async () => {
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
          } else {
            throw new Error(data.message);
          }
        }
        catch (error) {
          console.error('Error posting new event data:', error);
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
  const preventDefault = async (event) => {
    event.preventDefault();
    if (await checkAttendance()) {
      handleSubmission();
    }
  }
  const handleSubmission = async () => {
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
  }
  /*const fetchData = async () => {
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
  };*/
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
  const eraseExistingData = async () => {
    console.log(`Erasing existing data... ${year}-${month}-${date}`);
    // Format date as YYYY-MM-DD with leading zeros
    let formattedMonth = month < 10 ? `0${month}` : `${month}`;
    let formattedDate = date < 10 ? `0${date}` : `${date}`;
    const dateQuery = `${year}-${formattedMonth}-${formattedDate}`;
    const endpoint = `/data-api/rest/Attendance_Event`;
    try {
      const response = await fetch(`/data-api/rest/Attendance/service_date/${dateQuery}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-MS-API-ROLE': 'admin',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to erase existing Attendance data');
      }
    }
    catch (error) {
      console.error('Error in eraseExistingData:', error);
    }
    try {
      // 1. Fetch all Attendance_Event records
      const fetchResponse = await fetch(endpoint);
      if (!fetchResponse.ok) {
        throw new Error('Failed to fetch Attendance_Event records');
      }
      const fetchData = await fetchResponse.json();
      // 2. Filter for records with the matching service_date
      const recordsToDelete = (fetchData.value || []).filter(record => record.service_date === dateQuery);
      console.log('Records to delete:', recordsToDelete);
      if (recordsToDelete.length > 0) {
        // 3. Delete each record by its composite primary key (service_date and event_id)
        for (const record of recordsToDelete) {
          try {
            await fetch(`/data-api/rest/Attendance_Event/service_date/${dateQuery}/event_id/${record.event_id}`,
              {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  'X-MS-API-ROLE': 'admin',
                },
              }
            );
          } catch (err) {
            console.error('Error deleting Attendance_Event record:', err);
          }
        }
      }
    } catch (error) {
      console.error('Error erasing existing event data:', error);
    }
    return true;
  };
  const handleOverride = async () => {
    console.log('Handling override...');
    await eraseExistingData();
    await handleSubmission();
    setOverride(false); // Reset override state after handling
  }
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
  useEffect(() => {
    if (events.length !== 0) {
      setLoading(false);
      console.log('Events fetched successfully:', events);
    }
  }, [events]); // Run this effect when events change
  useEffect(() => {
    console.log('Overriding date');
    if (override) {
      handleOverride();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [override]);
  return (
    loading ? (
      <Loading/>
    ):
    !submitted ? (
      <div className="App">
      <h1>CBM Attendance</h1>
      <form>
        <DatePicker
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
          <Group className="dateGroup">
            <DateInput className="date-input"
              >
              {(segment) => <DateSegment segment={segment}
                onChange={(e) => {
                  console.log('Date segment changed:', e.target.value);
                }}/>
              }
            </DateInput>
            <Button className="calendar-buttons" onClick={e => handleShowCalendar(e)}>▼</Button>
          </Group>
          {showCalendar? 
            <Dialog>
              <Calendar>
                <header className="calendar-header">
                  <Button slot="previous">◀</Button>
                  <Heading />
                  <Button slot="next">▶</Button>
                </header>
                <CalendarGrid className="calendar-grid">
                  {(date) => <CalendarCell date={date} className="date"/>}
                </CalendarGrid>
              </Calendar>
            </Dialog>
          : null}
        </DatePicker>
        <br></br>
        <br></br>
        <label className = "adultCount">
          Adult Count
          <br></br>
          <input type="number" name="adult" min="0" className = "count"
            onChange={(e) => checkNumber(e.target.value, 'setAdultCount')} value={adultCount}
          />
        </label>
        <br></br>
        <br></br>
        <label>
          Child Count
          <br></br>
          <input type="number" name="child" min="0" className = "count"
            onChange={(e) => checkNumber(e.target.value, 'setChildCount')} value={childCount}
          />
        </label>
        <br></br>
        <br></br>
        <Label>Events (Optional)</Label>
        <br></br>
        {events.map((event) => (
          <label key={event.id} className = "checkboxes"> 
          <div className="checkboxesDiv">
          <input type="checkbox" name="event" value={event.event_name} className = "checkboxesBox"
          onChange={(e) => handleCheckboxChange(event.id, event.event_name)} // Handle checkbox changes
          />
          </div>
          <div className="eventName">{event.event_name}</div>
          </label>
        ))}
        {console.log('New events:', newEvents)}
        {newEvents.length !== 0 ?
          newEvents.map((event) => (
            <label key={event} className="checkboxes">
              <div className="checkboxesDiv">
              <input type="checkbox" name="event" value={event} defaultChecked className = "checkboxesBox"
              onChange={(e) => handleCheckboxChangeNewEvents(event)} // Handle checkbox changes
              />
              </div>
              <div className="eventName">{event}</div> 
              <Edit  name="edit" size={24} color="#535353" className="edit" onClick={() => editEventName(event)}/>
            </label>
          ))
          : null 
        }
        {editName ? 
          <Modal
            show={editName}
            onHide={() => { setEditName(false); setSpecifyEvent(''); }}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title id="contained-modal-title-vcenter">
                Edit Event Name
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <input type="text" className="newEvent" name="editEvent" onChange={(value) => settingEventName(value)} value={specifyEvent} required />
              <Button className="buttonPopUp" onPress={() => handleChangeName()}>Save</Button>
            </Modal.Body>
          </Modal>
          : null
        }
        <br></br>
        {addingNewEvent? 
        <Modal
            show={addingNewEvent}
            onHide={() => {setAddingNewEvent(false); setSpecifyEvent('');}}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title id="contained-modal-title-vcenter">
                Add New Event
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <input type="text" className="newEvent" name="newEvent" placeholder="New Event Name" onChange={(value) => settingEventName(value)} value={specifyEvent} required />
              <Button className="buttonPopUp" onPress={() => handleNewEventSubmission(specifyEvent)}>Add</Button>
            </Modal.Body>
          </Modal>
          :null
        }
        {duplicate ? 
          <Modal
            show={duplicate}
            onHide={() => { setDuplicate(false);}}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title id="contained-modal-title-vcenter">
                Duplicate Found
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Attendance for this date already exists. Do you want to continue with overriding the existing data?
              <br></br>
              <br></br>
            <div className="duplicatePopUp">
            <Button className="duplicatePopUp" onPress={() => setOverride(true)}>Continue</Button>
            <Button className="cancelPopUp" onPress={() => setDuplicate(false)}>Cancel</Button>
            </div>
            </Modal.Body>
          </Modal>
          : null
        }
        <br></br>
        <br></br>
        <div className = "buttons"> 
          <Button onPress={(e) => {addNewEvent(e)}} className="addEvent">Add New Event</Button>
          <button type="submit" onClick={preventDefault} className="addEvent">Submit</button>
        </div>
      </form>
      {/* <button id="get" onClick={fetchData}>Get</button> */}
      {/* <button id="check" onClick={checkAttendance}>Check</button> */}
      {/*data.map(entry => (
        <div key={entry.service_date + entry.adult_count + entry.child_count}>
          {`${entry.service_date} ${entry.adult_count} ${entry.child_count} ${entry.total}`}
        </div>
      ))*/}
    </div>
    ) : (
    <div className="App">
      <h1>CBM Attendance</h1>
      <p>Attendance submitted. Thank you!</p>
      <br></br>
      <Button className="addEvent" onPress={() => window.location.reload()}>Submit another attendance</Button>
    </div>
    )
  );
}
export default App;
/*Local Testing 
Set connection string first
npx swa start http://localhost:3000 --run "npm i && npm start" --data-api-location swa-db-connections*/
