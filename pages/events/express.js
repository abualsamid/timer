import Layout from 'components/layout'
import { useUser } from 'lib/auth'
import { usePost } from 'lib/fetch'
import { EventTimes, TimerLabels } from 'lib/timer'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { ulid } from 'ulid'

function TrackTimes({ addCompletedTime, updateActive }) {
  
  const [intervalId, setIntervalId] = useState(null)
  useEffect(() => {
    return () => clearInterval(intervalId)
  }, [])
  
  const [timers, setTimers] = useState(
    typeof window !== 'undefined'
      ? JSON.parse(window.localStorage.getItem('coachTimer.timers') || '[]')
      : []
  )
  
  const saveStateToLocalStorage = (timers) => {
    setTimers(_timers => timers )
    const active = timers.filter((timer) => !timer.finished).length
    updateActive(active)
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('coachTimer.timers', JSON.stringify(timers))
      }
    } catch (error) {
      console.log('error saving local storage. ', error)
    }
  }

  
  const stopUpdating = () => {
    if (intervalId) {
      clearInterval(intervalId)
      setIntervalId(null)
    }
  }
  const startUpdating = () => {
    if (!intervalId) {
      const i = setInterval(updateRunningClock, 1000 * 1)
      setIntervalId((_intervalId) => i)
    }
  }
  const updateRunningClock = () => {
    setTimers((timers) => {
      if (timers.length === 0) return [...timers]
      timers
        .filter((t) => t.started && !t.finished)
        .forEach((t) => {
          t.total = Date.now() - t.start
        })
      return [...timers]
    })
    
  }
  const addTimer = (e) => {
    e.preventDefault()
    const elems = e.currentTarget.elements
    
    const timer = {
      uid: ulid(),
      distance: elems.distance.value.trim() || '',
      name: elems.athlete.value.trim() || `Athlete ${timers.length + 1}`,
      started: false,
      finished: false,
      laps: [],
    }
    saveStateToLocalStorage([...timers, timer])

    elems.athlete.value = ''
    return false
  }

  const startAllTimers = () => {
    const _now = Date.now()
    startUpdating()
    saveStateToLocalStorage(timers.map((timer) => {
        if (!timer.finished && !timer.started) {
          timer.start = _now
          timer.started = true
        }
        return timer
      }))
  }

  const startTimer = (uid) => {
    startUpdating()

    const d = Date.now()
    const timer = timers.find((t) => t.uid === uid)
    timer.start = d
    timer.started = true
   
    saveStateToLocalStorage(timers.map((_timer) => (_timer.uid === uid ? timer : _timer)))
  }

  const lapTimer = (uid) => {
    const d = Date.now()
    const timer = timers.find((t) => t.uid === uid)
    timer.laps.push(d)

    saveStateToLocalStorage(timers.map((_timer) => (_timer.uid === uid ? timer : _timer)))
  }

  const finishTimer = async (uid) => {
    const d = Date.now()
    const timer = timers.find((t) => t.uid === uid)
    timer.laps.push(d)
    timer.end = d
    timer.total = d - timer.start
    timer.finished = true
    saveStateToLocalStorage(timers.map((_timer) => (_timer.uid === uid ? timer : _timer)))
    const remaining = timers.filter((timer) => !timer.finished).length
    if (!remaining) {
      stopUpdating()
    }
    try {
      addCompletedTime(timer, remaining)
    } catch (error) {
      console.log( error)
    }
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('coachTimer.timers', JSON.stringify(timers))
      }
    } catch (error) {
      console.log('error saving local storage.')
    }
    

  }

  if (timers.length > 0) {
    startUpdating()
  }
  
  return (
      <div className="container">
        <Form addTimer={addTimer} />
        {timers
          .filter((timer) => !timer.finished)
          .map((timer,i) => {
            return (
              <div className="row m-3 card" key={i}>
                <TimerLabels timer={timer} />
                <ul className="nav nav-justified my-2">
                  {!timer.started && !timer.finished && (
                    <li className="nav-item">
                      <button
                        type="button"
                        className="btn-primary btn btn-lg p-3"
                        onClick={(e) => startTimer(timer.uid)}
                      >
                        Start
                      </button>
                    </li>
                  )}
                  {timer.started && !timer.finished && (
                    <li className="nav-item">
                      <button
                        type="button"
                        className="btn-primary btn btn-lg p-3"
                        onClick={(e) => lapTimer(timer.uid)}
                      >
                        Lap
                      </button>
                    </li>
                  )}
                  {timer.started && !timer.finished && (
                    <li className="nav-item">
                      <button
                        type="button"
                        className="btn-danger btn btn-lg p-3"
                        onClick={(e) => finishTimer(timer.uid)}
                      >
                        Finish
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            )
          })}
        <div className="d-grid">
          {timers.filter((timer) => !timer.finished && !timer.started).length >
            1 && (
            <button className="btn-danger btn" onClick={startAllTimers}>
              Start all Timers
            </button>
          )}
        </div>
      </div>
  )
}

const Form = ({ addTimer }) => {
  return (
    <form
      onSubmit={(e) => {
        addTimer(e)
      }}
      autoComplete="off"
    >
      <div className="mb-3">
        <label htmlFor="athlete">Athlete's name</label>
        <input
          className="form-control"
          name="athlete"
          id="athlete"
          type="text"
          placeholder="Athlete Name"
          autoComplete="off"
        ></input>
      </div>
      <div className="mb-3">
        <label htmlFor="athlete">distance</label>
        <input
          className="form-control"
          name="distance"
          id="distance"
          type="text"
          placeholder="distance"
          
          autoComplete="off"
        ></input>
      </div>

      <div className="d-grid gap-2">
        <button type="submit" className="btn btn-primary btn-lg">
          Add Athlete to Time
        </button>
      </div>
    </form>
  )
}


const SaveForm = ({user, createEvent}) => {
  const onSubmit = async (e) => {
    e.preventDefault()

    const elems = e.currentTarget.elements
    const track = elems.trackName.value.trim()
    const notes = elems.notes.value.trim()
    const name = elems.eventName.value.trim()
    const data = {
      track,
      notes,
      name,
      date: new Date(),
    }
    createEvent(data)
    return false
  }
  return (
    <div className="container">
      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <label htmlFor="eventName">Event Name</label>
          <input type="text" className="form-control" name="eventName" />
        </div>
        <div className="mb-3">
          <label htmlFor="trackId">Track</label>
          <input type="text" name="trackName" className="form-control" />
        </div>
        <div className="mb-3">
          <label htmlFor="notes">Notes</label>
          <input type="text" className="form-control" name="notes" />
        </div>
        <div className="d-grid">
          <button className="btn btn-primary btn-lg" type="submit">
            Save to Database...
          </button>
        </div>
        <br/>
      </form>
    </div>
  )
}

const clearLocalStorage = () => {
  typeof window !== 'undefined' &&
    window.localStorage.removeItem('coachTimer.completedTimes')
  typeof window !== 'undefined' &&
    window.localStorage.removeItem('coachTimer.timers')
}
const Home = () => {
  const router = useRouter()
  const [event, setEvent] = useState(null)
  const [active, setActive] = useState(0)
  const [completedTimes, setCompletedTimes] = useState(
    typeof window !== 'undefined'
      ? JSON.parse(
          window.localStorage.getItem('coachTimer.completedTimes') || '[]'
        )
      : []
  )
  const user = useUser()
  
  const updateActive = active => setActive(active)
  const addCompletedTime = (time, active) => {
    setCompletedTimes((times) => {
      const newTimes = [...times, time]
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          'coachTimer.completedTimes',
          JSON.stringify(newTimes)
        )
      }
      return newTimes
    })
    setActive(active)
  } 
  const createEvent = async data => {
    const res = await usePost('createEvent', data)
    setEvent(res.Item)
    console.log('createEvent completed times ', completedTimes)
    try {
      usePost(
        'createTimers',
        completedTimes.map((time) => ({
          ...time,
          finished: true,
          eventId: res.Item.key,
        }))
      ).then((res) => { 
        console.log('saved')
        clearLocalStorage()
        // router.push('/')
    })
    } catch (error) {
      console.log('Failed in API call ', error)
    }
    
  }
  return (
    <Layout user={user}>
      {event && (
        <h2 className="text-center">
          {event.name} - {new Date(event.date).toString()}
        </h2>
      )}
      {user &&
        completedTimes &&
        completedTimes.length > 0 &&
        event == null &&
        !active && <SaveForm user={user} createEvent={createEvent} />}
      <TrackTimes addCompletedTime={addCompletedTime} updateActive={updateActive} user={user} />
      <EventTimes times={completedTimes} />
    </Layout>
  )
}

export default Home
