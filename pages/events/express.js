import { Auth } from 'aws-amplify'
import Layout from 'components/layout'
import { EventTimes, TimerLabels } from 'lib/timer'
import { useEffect, useState } from 'react'
import { ulid } from 'ulid'

function TrackTimes({ addCompletedTime }) {
  const [timers, setTimers] = useState(window?JSON.parse(window.localStorage.getItem('coachTimer.timers') || '[]') :[])
  const [intervalId, setIntervalId] = useState(null)

  
  const saveStateToLocalStorage = () => {
    try {
      if (window) {
        window.localStorage.setItem('coachTimer.timers', JSON.stringify(timers))
      }
    } catch (error) {
      console.log('error saving local storage.')
    }
  }
  useEffect(() => {
    return () => clearInterval(intervalId)
  }, [])

  const stopUpdating = () => {
    if (intervalId) {
      console.log('stopping ticker...')
      clearInterval(intervalId)
      setIntervalId(null)
    }
  }
  const startUpdating = () => {
    if (!intervalId) {
      console.log('starting ticker...')
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
    if (Date.now() % 10 === 0) {
      saveStateToLocalStorage()
    }
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
    setTimers((timers) => [...timers, timer])

    elems.athlete.value = ''
    console.log('added timer ', timer)
    saveStateToLocalStorage()
    return false
  }

  const startAllTimers = () => {
    const _now = Date.now()
    startUpdating()

    setTimers((timers) =>
      timers.map((timer) => {
        if (!timer.finished && !timer.started) {
          timer.start = _now
          timer.started = true
        }
        return timer
      })
    )
    saveStateToLocalStorage()

  }

  const startTimer = (uid) => {
    startUpdating()

    const d = Date.now()
    const timer = timers.find((t) => t.uid === uid)
    timer.start = d
    timer.started = true
    setTimers((timers) =>
      timers.map((_timer) => (_timer.uid === uid ? timer : _timer))
    )
    saveStateToLocalStorage()

  }
  const lapTimer = (uid) => {
    const d = Date.now()
    const timer = timers.find((t) => t.uid === uid)
    timer.laps.push(d)

    setTimers((timers) =>
      timers.map((_timer) => (_timer.uid === uid ? timer : _timer))
    )
    saveStateToLocalStorage()

  }

  const finishTimer = async (uid) => {
    const d = Date.now()
    const timer = timers.find((t) => t.uid === uid)
    timer.laps.push(d)
    timer.end = d
    timer.total = d - timer.start
    timer.finished = true

    setTimers((timers) =>
      timers.map((_timer) => (_timer.uid === uid ? timer : _timer))
    )

    try {
      addCompletedTime(timer)
    } catch (error) {
      console.log( error)
    }
    try {
      if (window) {
        window.localStorage.setItem('coachTimer.timers',JSON.stringify(timers))
      }
    } catch (error) {
      console.log('error saving local storage.')
    }
    const remaining = timers.filter((timer) => !timer.finished).length
    if (!remaining) {
      stopUpdating()
    }
    saveStateToLocalStorage()

  }

  if (timers.length > 0) {
    startUpdating()
  }
  
  return (
      <div className="container">
        <Form addTimer={addTimer} />
        {timers
          .filter((timer) => !timer.finished)
          .map((timer) => {
            return (
              <div className="row m-3 card">
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
    <div style={{border: '1px solid black'}} onClick={e => onClick(name)}>
      {name}
    </div>
  )
}
const Form = ({ addTimer }) => {
  const [search, setSearch] = useState("")
  const onClick = name => setSearch(name)
  return (
    <form onSubmit={addTimer} autocomplete="off">
      <div className="mb-3">
        <label htmlFor="athlete">Athlete's name</label>

        <input
          className="form-control"
          name="athlete"
          id="athlete"
          type="text"
          placeholder="Athlete Name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autocomplete="off"
        ></input>
      </div>
      {athletes
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





const Home = () => {
  const [completedTimes, setCompletedTimes] = useState(window?JSON.parse(window.localStorage.getItem('coachTimer.completedTimes')||'[]'):[])
  const [user, setUser] = useState(null)
  const [athletes, setAthletes] = useState([])
  useEffect(()=> {
    async function checkUser() {
      const u = await Auth.currentAuthenticatedUser()
      console.log('current user ', u)
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
    if(window){
      window.localStorage.setItem('coachTimer.completedTimes', JSON.stringify(newTimes))
    }
    return newTimes
  })
  return (
    <Layout>
      <TrackTimes addCompletedTime={addCompletedTime} user={user} />
      <EventTimes times={completedTimes} />
    </Layout>
  )
}

export default Home
