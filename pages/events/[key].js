
import { withAuthenticator } from '@aws-amplify/ui-react'
import Layout from 'components/layout'
import { useGet, usePost } from 'lib/fetch'
import { EventTimes, TimerLabels } from 'lib/timer'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { ulid } from 'ulid'

function TrackTimes({ addCompletedTime, athletes, eventId }) {
  const [timers, setTimers] = useState([])
  const [intervalId, setIntervalId] = useState(null)
  const router = useRouter()

  useEffect(() => {
    return () => clearInterval(intervalId)
  }, [])

  const stopUpdating = () => {
    if(intervalId) {
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
  }
  const addTimer = (e, athleteId) => {
    e.preventDefault()
    const elems = e.currentTarget.elements
    let athlete
    if (athleteId) {
      athlete = {
        ...athletes.Items.find((a) => a.key === athleteId),
      }
    }

    const distance = elems.distance.value.trim() || ''
    const track = ''
    const name = `${athlete.name} - ${distance}`
    const timer = {
      uid: ulid(),
      name,
      track,
      athlete,
      distance,
      started: false,
      finished: false,
      laps: [],
    }
    setTimers((timers) => [...timers, timer])

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
  }
  const lapTimer = (uid) => {
    const d = Date.now()
    const timer = timers.find((t) => t.uid === uid)
    timer.laps.push(d)
    setTimers((timers) =>
      timers.map((_timer) => (_timer.uid === uid ? timer : _timer))
    )
  }

  const finishTimer = async (uid) => {
    const d = Date.now()
    const timer = timers.find((t) => t.uid === uid)
    timer.laps.push(d)
    timer.end = d
    timer.total = d - timer.start
    timer.finished = true
    timer.eventId = eventId

    setTimers((timers) =>
      timers.map((_timer) => (_timer.uid === uid ? timer : _timer))
    )
    try {
        usePost('createTimer', timer).then((res) =>
          console.log('created timer on server ', res))
        addCompletedTime(timer)

    } catch (error) {
      console.log('Failed in API call ', error)
    }
    const remaining = timers.filter(timer => !timer.finished).length 
    if(!remaining) {
      stopUpdating()
    }
  }
  return (
      <div className="container">
        <Form addTimer={addTimer} athletes={athletes} />
        <br />
        {timers
          .filter((timer) => !timer.finished)
          .map((timer, i) => {
            return (
              <div className="row m-1 card" key={i}>
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
                </p>
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

const Form = ({addTimer, athletes}) => {
  const [selectedAthleteId, setSelectedAthleteId] = useState("")
  const selectAthlete = e =>  setSelectedAthleteId(e.target.value)
  const handleSubmit = e => {e.preventDefault(); addTimer(e,selectedAthleteId)}

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="athlete">Athlete's name</label>
        <select
          className="form-select form-select-lg my-3"
          name="athleteId"
          value={selectedAthleteId}
          onChange={selectAthlete}
        >
          <option value="">Select or Enter new athlete</option>
          {athletes &&
            athletes.Items.map(({ key, name }) => (
              <option value={key} key={key}>
                {name}
              </option>
            ))}
        </select>
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
          Add Athlete
        </button>
      </div>
    </form>
  )
}




const Home = () => {
  const router = useRouter()
  const { key: eventId } = router.query

  const { data: completedTimes, mutate } = useGet(`/getTimes/${eventId}`)
  const addCompletedTime = (time) => {
    mutate()
    // do something clever with mutate here 
    //  setCompletedTimes((times) => [...times, time])
  }
  console.log('eventId ', eventId, 'completedTimes ', completedTimes)
  const { data: athletes = { Items: [] } } = useGet('/getAthletes')
  return (
    <Layout>
      <TrackTimes
        addCompletedTime={addCompletedTime}
        athletes={athletes}
        eventId={eventId}
      />
      {completedTimes && <EventTimes times={completedTimes.Items} />}
    </Layout>
  )
}

export default withAuthenticator(Home, { usernameAlias: 'email' })

