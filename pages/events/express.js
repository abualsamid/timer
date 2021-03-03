import { withAuthenticator } from '@aws-amplify/ui-react'
import Layout from 'components/layout'
import { EventTimes, TimerLabels } from 'lib/timer'
import { useEffect, useState } from 'react'
import { ulid } from 'ulid'

function TrackTimes({ addCompletedTime }) {
  const [timers, setTimers] = useState([])
  console.log('express...')
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
    return false
  }

  const startAllTimers = () => {
    const _now = Date.now()
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

    setTimers((timers) =>
      timers.map((_timer) => (_timer.uid === uid ? timer : _timer))
    )

    try {
      addCompletedTime(timer)
    } catch (error) {
      console.log( error)
    }
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

const Form = ({ addTimer }) => {
  return (
    <form onSubmit={addTimer}>
      <div className="mb-3">
        <label htmlFor="athlete">Athlete's name</label>
        
        <input
          className="form-control"
          name="athlete"
          id="athlete"
          type="text"
          placeholder="Athlete Name"
        ></input>
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
  const [completedTimes, setCompletedTimes] = useState([])
  const addCompletedTime = (time) => setCompletedTimes((times) => [...times, time])
  return (
    <Layout>
      <TrackTimes addCompletedTime={addCompletedTime} />
      <EventTimes times={completedTimes} />
    </Layout>
  )
}

export default withAuthenticator(Home, { usernameAlias: 'email' })
