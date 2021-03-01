
import { withAuthenticator } from '@aws-amplify/ui-react'
import Layout from 'components/layout'
import { useGet, usePost } from 'lib/fetch'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { ulid } from 'ulid'

function TrackTimes({addTime, athletes, mutate}) {
  const [timers, setTimers] = useState([])
  
  console.log('athletes are ', athletes)
  const router = useRouter()
  const { key } = router.query 

  useEffect(() => {
    const intervalId = setInterval(updateRunningClock, 1000 * 1)
    return () => clearInterval(intervalId)
  }, [])

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
    let athlete 
    if (elems.athleteId.value) {
      athlete = {
        ...athletes.Items.find(a => a.id==elems.athleteId.value)
      }
    } else {
      athlete = {
        name: elems.athlete.value.trim() || `Athlete ${athletes.Items.length + 1}`,
        id: ulid(),
      }
    }

    const distance = elems.distance.value.trim() || ''
    const track=''
    const name = `${track} - ${athlete.name} - ${distance}`
    const timer = {
      uid:  ulid(),
      name,
      track,
      athlete,
      distance,
      started: false,
      finished: false,
      laps: [],
    }
    setTimers((timers) => [...timers, timer])
    
    elems.athlete.value = ''
    console.log('added timer ', timer )
    return false
  }
  
  const startAllTimers = () => {
    const _now = Date.now()
    setTimers(
      timers => timers.map(
          timer => {
            if(!timer.finished && !timer.started) {
              timer.start = _now
              timer.started = true 
            }
            return timer 
          }
        )
    )
  }

  const startTimer = (uid) => {
    const d = Date.now() 
    const timer = timers.find(t => t.uid === uid )
    timer.start = d 
    timer.started = true 
    setTimers(
      timers => timers.map( _timer => _timer.uid===uid ? timer : _timer )
    )
  }
  const lapTimer = (uid) => {
    const d = Date.now()
    const timer = timers.find((t) => t.uid === uid)
    timer.laps.push(d)

    setTimers(
      timers => timers.map(_timer => _timer.uid ===uid ? timer : _timer )
    )
  }

  const finishTimer = async (uid) => {
    const d = Date.now()
    const timer = timers.find( t => t.uid === uid)
    timer.laps.push(d)
    timer.end = d
    timer.total = d - timer.start
    timer.finished = true
    timer.eventId = key 

    setTimers( timers => timers.map(
      _timer => _timer.uid === uid ? timer : _timer 
    ))
   
    
    try {
      if (key!=='express') {
        usePost('createTimer', timer).then(
          res => console.log('created timer on server ', res)
        )
      }
      addTime(timer)
    } catch (error) {
      console.log('Failed in API call ', error)
    }
  }
  return (
    <Layout>
      <div className="container">
        {timers
          .filter((timer) => !timer.finished)
          .map((timer) => {
            return (
              <div className="row m-3">
                <TimerLabels timer={timer} />
                <p>
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
                      className="btn-secondary btn m-2"
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
                </p>
              </div>
            )
          })}
        <div className="d-grid">
          {timers.filter((timer) => !timer.finished && !timer.started).length >
            0 && (
            <button className="btn-danger btn" onClick={startAllTimers}>
              Start all Timers
            </button>
          )}
        </div>
        <hr />
        <Form addTimer={addTimer} athletes={athletes} />
        <br />
      </div>
    </Layout>
  )
}

const Form = ({addTimer, athletes}) => {
  return (
    <form onSubmit={addTimer}>
      <div className="mb-3">
        <label htmlFor="athlete">Athlete's name</label>
        <select className="form-select form-select-lg my-3" name="athleteId">
          <option value="">Select or Enter new athlete</option>
          {athletes &&
            athletes.Items.map(({ id, name }, i) => (
              <option value={id} key={i}>
                {name}
              </option>
            ))}
        </select>
        <input
          className="form-control"
          name="athlete"
          id="athlete"
          type="text"
          placeholder="Athlete Name"
        ></input>
      </div>
      <div className="mb-3">
        <label htmlFor="distance">Distance</label>
        <input
          type="text"
          className="form-control"
          name="distance"
          placeholder="distance"
        />
      </div>
      <div className="d-grid gap-2">
        <button type="submit" className="btn btn-primary btn-lg">
          Add Timer
        </button>
      </div>
    </form>
  )
}
const TimerLabels = ({ timer }) => {
  console.log('Timer Labels.')
  return (
    <div className="row m-3">
      <p className="fw-bold">{timer.name}</p>
      <p>
        {timer.start && (
          <span>
            <strong>Start:</strong> {new Date(timer.start).toString()}
          </span>
        )}
        {timer.end && (
          <span>
            {' '}
            / <strong>End: </strong> {new Date(timer.end).toString()}
          </span>
        )}
      </p>
      {timer.laps &&
        timer.laps.map((lap, i) => {
          return (
            <div>
              <strong>lap {i + 1}: </strong> {'  '}
              {myFormat({
                end: lap,
                start: i == 0 ? timer.start : timer.laps[i - 1],
              })}
            </div>
          )
        })}
      {timer.started && (
        <p className={timer.finished ? 'fw-bold' : ''}>
          Total Time:{' '}
          {timer.started && (
            <span>
              {myFormat({ start: timer.start, end: timer.end || Date.now() })}
            </span>
          )}
        </p>
      )}

      <hr />
    </div>
  )
}

const MINUTE = 60 
const HOUR = 60
const pad = n => n<10?`0${n}`:n 
const myFormat = ({start, end}) => {
  const diff = Math.trunc((end-start)/1000) 
  const seconds = diff % 60 
  let hours = 0 
  let trueMinutes = 0 
  let minutes = ( diff - seconds ) / MINUTE 
  if (minutes>59) {
    trueMinutes = minutes % HOUR
    hours = (minutes - trueMinutes) / HOUR 
    minutes = trueMinutes 
  }
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}` 
}
const EventTimes = ({times}) => {
  return (
    <div className="container">
      <div className="row m-3">
        {times.map((timer) => (
          <TimerLabels timer={timer} />
        ))}
      </div>
    </div>
  )
}

const Home = () => {
  const [times, setTimes] = useState([])
  const addTime = time => setTimes(times => [...times, time])
  const { data: athletes = { Items: [] }, mutate } = useGet('/getAthletes')

  console.log('Home...')
  return (
  <>
    <TrackTimes addTime={addTime} athletes={athletes} mutate={mutate}/>
    <EventTimes times={times}/>
  </>
  )
}

export default withAuthenticator(Home, { usernameAlias: 'email' })

