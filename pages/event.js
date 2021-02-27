import { withAuthenticator } from '@aws-amplify/ui-react'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { formatDuration, intervalToDuration } from 'date-fns'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useGet, usePost } from '../lib/fetch'
import styles from '../styles/Home.module.css'

function TrackTimes() {
  const [timers, setTimers] = useState([])
  const [tracks, setTracks] = useState([])
  const [athletes, setAthletes] = useState([])

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
      elems.athleteId.value ||
      elems.athlete.value.trim() ||
      `Athlete ${athletes.length + 1}`
    const distance = elems.distance.value.trim() || ''
    const track = elems.trackId.value || elems.trackName.value.trim() || ''

    const name = `${track} - ${athlete} - ${distance}`
    const timer = {
      name,
      track,
      athlete,
      distance,
      started: false,
      finished: false,
      laps: [],
    }
    setTimers((timers) => [...timers, timer])
    if (track) {
      setTracks((tracks) => [...new Set([...tracks, track])].sort())
    }
    if (athlete) {
      setAthletes((athletes) => [...new Set([...athletes, athlete])].sort())
    }
    elems.athlete.value = ''
    console.log('added timer')
    return false
  }
  const startTimer = (i) => {
    setTimers((timers) => {
      timers[i].start = Date.now()
      timers[i].started = true
      return [...timers]
    })
  }
  const lapTimer = (i) => {
    setTimers((timers) => {
      timers[i].laps.push(Date.now())
      return [...timers]
    })
  }
  const finishTimer = async (i) => {
    const d = Date.now()
    const timer = timers[i]
    timer.laps.push(d)
    timer.end = d
    timer.total = d - timer.start
    timer.finished = true

    setTimers((timers) => {
      timers[i] = timer
      return [...timers]
    })
    try {
      const res = await usePost('createTimer', timer)
      console.log('post res is ', res)
    } catch (error) {
      console.log('Failed in API call ', error)
    }
  }
  return (
    <div className={`container ${styles.container} ${styles.main}`}>
      <Head>
        <title>timers because no good ones exist</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container">
        {timers.map((timer, i) => {
          return (
            <div className="row m-3">
              <TimerLables timer={timer} />

              <p>
                {!timer.started && !timer.finished && (
                  <button
                    type="button"
                    className="btn-primary btn m-2"
                    onClick={(e) => startTimer(i)}
                  >
                    Start
                  </button>
                )}
                {timer.started && !timer.finished && (
                  <button
                    type="button"
                    className="btn-secondary btn m-2"
                    onClick={(e) => lapTimer(i)}
                  >
                    Lap
                  </button>
                )}
                {timer.started && !timer.finished && (
                  <button
                    type="button"
                    className="btn-danger btn m-2"
                    onClick={(e) => finishTimer(i)}
                  >
                    Finish
                  </button>
                )}
              </p>
            </div>
          )
        })}
        <hr />
        <form onSubmit={addTimer}>
          <div className="mb-3">
            <label htmlFor="trackName">Track</label>
            <select className="form-select form-select-lg my-3" name="trackId">
              <option value="">Select or Enter new track</option>
              {tracks.map((t, i) => (
                <option value={t} key={i}>
                  {t}
                </option>
              ))}
            </select>
            <input
              className="form-control my-3"
              placeholder="new track"
              name="trackName"
            ></input>
          </div>

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
    </div>
  )
}

const TimerLables = ({ timer }) => {
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
    </div>
  )
}
const HistoricalData = () => {
  const historicalData = useGet('getTimes')
  const { data } = historicalData
  console.log(historicalData.data)
  return (
    <div className="container">
      <div className="row m-3">
        {data &&
          data.Items &&
          data.Items.length > 0 &&
          data.Items.map((item) => {
            const timer = unmarshall(item)
            return (
              <>
                <TimerLables timer={timer} />
                <hr />
              </>
            )
          })}
      </div>
    </div>
  )
}

const Home = () => (
  <>
    <TrackTimes />
    <HistoricalData />
  </>
)
export default withAuthenticator(Home, { usernameAlias: 'email' })
