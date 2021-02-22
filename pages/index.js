import { formatDuration, intervalToDuration } from 'date-fns'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'

export default function Home() {
	const [timers, setTimers] = useState([])
  const [track, setTrack] = useState('')
  const [tracks, setTracks] = useState([])
  
  useEffect(
    () => {
      const intervalId = setInterval(updateStuff, 1000*1)
      return () => clearInterval(intervalId)
    }
    ,[timers]
  )
  const changeTrack = (e) => {
    console.log(e.target.value)
    if (e.target.value === '') {
      e.target.form.elements.newTrackName.disabled = false 
    } else {
      e.target.form.elements.newTrackName.disabled = true 
      e.target.form.elements.newTrackName.value = "" 
    }
  }
  const selectTrack = e => {
    const form = e.target.form 
    const trackName = form.elements.trackName.value 
    const newTrackName = form.elements.newTrackName.value.trim()
    if (trackName!=='' || newTrackName!=='') {
      const n = trackName || newTrackName 
      if (n===newTrackName) {
        setTracks(
          tracks => {
            tracks.push(n)
            return tracks 
          }
        )
      }
      setTrack((track) => n)
    }
  }
  const updateStuff = () => {
    
    setTimers( timers => {
      if(timers.length===0) return [...timers]  
      timers.filter(t => t.started && !t.finished ).forEach(
          t => {
            t.total = Date.now() - t.start 
          }
        )
      return [...timers]
    })
  }
  const addTimer = e => {
    e.preventDefault()
    const name =
      e.currentTarget.elements.athelete.value.trim() || `Athelete ${timers.length + 1}`
    const distance = e.currentTarget.elements.distance.value.trim() || ''
    const timer = {
      name,
      distance, 
      started: false ,
      finished: false, 
      laps:[]
    }
    const t = [...timers]
    setTimers(
      timers => [...timers, timer]
    )
    e.currentTarget.elements.athelete.value = ''
    console.log('added timer')
    return false 
  }
  const startTimer = i => {
    setTimers(
      timers => {
        timers[i].start = Date.now()
        timers[i].started = true 
        return [...timers]
      }
    )
  }
  const lapTimer = i => {
    setTimers(
      timers => {
        timers[i].laps.push(Date.now())
        return [...timers]
      }
    )
  }
  const finishTimer = i => {
    const d = Date.now() 
    const t = [...timers]
    t[i].laps.push(d) 
    t[i].end = d 
    t[i].total = d - t[i].start 
    t[i].finished = true 
    setTimers([...t])
  }
  return (
    <div className={`container ${styles.container} ${styles.main}`}>
      <Head>
        <title>timers because no good ones exist</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container">
        {
          track && <h2>{track}</h2>
        }
        {timers.map((timer, i) => {
          return (
            <div className="row  m-3">
              <p className="fw-bold">{timer.name} - {timer.distance}</p>
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
              <p>
                {timer.laps.map((lap, i) => {
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
              </p>
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
            <label htmlFor="athelete">Athelete's name</label>
            <input
              className="form-control"
              name="athelete"
              id="athlete"
              type="text"
              placeholder="Athlete Name"
            ></input>
          </div>
          <div className="mb-3">
            <label htmlFor="distance">Distance</label>
            <input type="text" className="form-control" name='distance' placeholder='distance'/>
          </div>
          <div className="d-grid gap-2">
            <button type="submit" className="btn btn-primary btn-lg">
              Add Timer
            </button>
          </div>
        </form>
        <br />

        <form
          onSubmit={(e) => {
            e.preventDefault()
            return false
          }}
        >
          <select
            className="form-select form-select-lg my-3"
            name="trackName"
            onChange={changeTrack}
          >
            <option value="">Select</option>
            {tracks.map((t,i) => (
              <option value={t} key={i}>
               {t}
              </option>
            ))}
            
          </select>
          <input
            className="form-control my-3"
            placeholder="new track"
            name="newTrackName"
          ></input>
          <div className="d-grid gap-2">
            <button
              type="button"
              className="btn btn-primary"
              onClick={selectTrack}
            >
              Select Track
            </button>
          </div>
        </form>
      </div>
    </div>
  )     
}
