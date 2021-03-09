import { Auth } from 'aws-amplify'
import Layout from 'components/layout'
import { EventTimes, TimerLabels } from 'lib/timer'
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

const athletes = [
  {name: 'Asia'},
  {name: 'Bassel'},
  {name: 'Ahmad'},
  {name: 'John'},
  {name: 'Joe'}
]
const matchName = (name, search) => {
  return search.length>0 && name.includes(search)
}
const SearchPreview = ({name},onClick) => {
  return (
    <div className='auto-complete' onClick={e => onClick(name)}>
      {name}
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
      {(search === '' || !picked) &&
        athletes
          .filter((a) => matchName(a.name, search))
          .map((a) => SearchPreview(a, onClick))}

      <div className="d-grid gap-2">
        <button type="submit" className="btn btn-primary btn-lg">
          Add Athlete to Time
        </button>
      </div>
    </form>
  )
}


const SaveForm = ({user}) => {
  const createEvent = async (e) => {
    e.preventDefault()

    const elems = e.currentTarget.elements
    const track = elems.trackId.value || elems.trackName.value.trim()
    const notes = elems.notes.value.trim()
    const name = elems.eventName.value.trim()
    const data = {
      track,
      notes,
      name,
      date: new Date(),
    }
    const res = await usePost('createEvent', data)
    console.log(res)
    router.push(`/events/${res.Item.key}`)
    return false
  }
  return (
    <form onSubmit={createEvent}>
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


const Home = () => {
  const [completedTimes, setCompletedTimes] = useState(
    typeof window !== 'undefined'
      ? JSON.parse(
          window.localStorage.getItem('coachTimer.completedTimes') || '[]'
        )
      : []
  )
  const [user, setUser] = useState(null)
  const [athletes, setAthletes] = useState([])
  useEffect(()=> {
    async function checkUser() {
      const u = await Auth.currentAuthenticatedUser()
      setUser(u)
    }
    checkUser()
  },[])
  // if(user) {
  //     const { data } =  useGet('/getAthletes')
  //     if (data) {
  //       console.log('got athlete list from server ', data)
  //       setAthletes([...data])
  //     }
  // } else {
  //   const a = window ? window.localStorage.getItem('athletes'): []
  //   if (a) {
  //     setAthletes([...a])
  //   }
  // }
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
  return (
    <Layout>
      <TrackTimes addCompletedTime={addCompletedTime} user={user} />
      <EventTimes times={completedTimes} />
      {
        user && completedTimes && <SaveForm user={user} />
      }
    </Layout>
  )
}

export default Home
