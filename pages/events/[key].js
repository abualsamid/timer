
import { withAuthenticator } from '@aws-amplify/ui-react'
import Layout from 'components/layout'
import { formatDuration, intervalToDuration } from 'date-fns'
import { usePost } from 'lib/fetch'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { ulid } from 'ulid'

function TrackTimes({addTime}) {
  const [timers, setTimers] = useState([])
  const [tracks, setTracks] = useState([])
  const [athletes, setAthletes] = useState([])

  const router = useRouter()
  const { key } = router.query 
  useEffect(() => {
    const intervalId = setInterval(updateRunningClock, 1000 * 1)
    return () => clearInterval(intervalId)
  }, [timers])

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
    const athlete =
      elems.athlete.value.trim() ||
      elems.athleteId.value ||
      `Athlete ${athletes.length + 1}`
    const distance = elems.distance.value.trim() || ''
    const track=''
    const name = `${track} - ${athlete} - ${distance}`
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
    
    if (athlete) {
      setAthletes((athletes) => [...new Set([...athletes, athlete])].sort())
    }
    elems.athlete.value = ''
    console.log('added timer')
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
        <form onSubmit={addTimer}>
          <div className="mb-3">
            <label htmlFor="athlete">Athlete's name</label>
            <select
              className="form-select form-select-lg my-3"
              name="athleteId"
            >
              <option value="">Select or Enter new athlete</option>
              {athletes.map((t, i) => (
                <option value={t} key={i}>
                  {t}
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
        <br />
      </div>
    </Layout>
  )
}

const TimerLabels = ({ timer }) => {
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
              lap {i + 1}:{' '}
              {formatDuration(
                intervalToDuration({
                  end: lap,
                  start: i == 0 ? timer.start : timer.laps[i - 1],
                })
              )}
            </div>
          )
        })}
      <p className={timer.finished ? 'fw-bold' : ''}>
        Total Time:{' '}
        {timer.started && (
          <span>
            {formatDuration(
              intervalToDuration({
                start: timer.start,
                end: timer.end || Date.now(),
              })
            )}
          </span>
        )}
      </p>
      <hr/>
    </div>
  )
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
  return (
  <>
    <TrackTimes addTime={addTime}/>
    <EventTimes times={times}/>
  </>
  )
}

export default withAuthenticator(Home, { usernameAlias: 'email' })

