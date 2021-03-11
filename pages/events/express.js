import { Auth } from 'aws-amplify'
import Layout from 'components/layout'
import { usePost } from 'lib/fetch'
import { EventTimes, TimerLabels } from 'lib/timer'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { ulid } from 'ulid'

function TrackTimes({ addCompletedTime }) {
  
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
    const athlete = {
      name:
        elems.athlete.value.trim() || `Athlete ${timers.length + 1}`,
      id: ulid(),
    }
    const name = `${athlete.name}`
    const timer = {
      uid: ulid(),
      name,
      athlete,
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


    try {
      addCompletedTime(timer)
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
    const remaining = timers.filter((timer) => !timer.finished).length
    if (!remaining) {
      stopUpdating()
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
                <div>
                  {!timer.started && !timer.finished && (
                    <button
                      type="button"
                      className="btn-primary btn m-2"
                      onClick={(e) => startTimer(timer.uid)}
                    >
                      Start
                    </button>
                  )}
                  {timer.started && !timer.finished && (
                    <button
                      type="button"
                      className="btn-primary btn m-2"
                      onClick={(e) => lapTimer(timer.uid)}
                    >
                      Lap
                    </button>
                  )}
                  {timer.started && !timer.finished && (
                    <button
                      type="button"
                      className="btn-danger btn m-2"
                      onClick={(e) => finishTimer(timer.uid)}
                    >
                      Finish
                    </button>
                  )}
                </div>
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
  const [search, setSearch] = useState("")
  const [picked, setPicked] = useState(false) 
  const onClick = name => { setSearch(name); setPicked(true) }
  return (
    <form
      onSubmit={(e) => {
        addTimer(e)
        setSearch('')
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
          value={search}
          onChange={(e) => {
            setPicked(false)
            setSearch(e.target.value)
          }}
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
        <button className="btn btn-primary" type="submit">
          Save to Database...
        </button>
      </div>
    </form>
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
  const [completedTimes, setCompletedTimes] = useState(
    typeof window !== 'undefined'
      ? JSON.parse(
          window.localStorage.getItem('coachTimer.completedTimes') || '[]'
        )
      : []
  )
  const [user, setUser] = useState(null)
  useEffect(()=> {
    async function checkUser() {
      const u = await Auth.currentAuthenticatedUser()
      setUser(u)
    }
    checkUser()
  },[])
  
  const addCompletedTime = (time) => setCompletedTimes((times) => {
    const newTimes = [...times, time]
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        'coachTimer.completedTimes',
        JSON.stringify(newTimes)
      )
    }
    return newTimes
  })
  const createEvent = async data => {
    const res = await usePost('createEvent', data)
    setEvent(res.Item)

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
        router.push('/')
    })
    } catch (error) {
      console.log('Failed in API call ', error)
    }
    
  }
  return (
    <Layout>
      {event && (
        <h2 className='text-center'>
          {event.name} - {new Date(event.date).toString()}
        </h2>
      )}
      <TrackTimes addCompletedTime={addCompletedTime} user={user} />
      <EventTimes times={completedTimes} />
      {user && completedTimes && event==null && (
        <SaveForm user={user} createEvent={createEvent} />
      )}
    </Layout>
  )
}

export default Home
