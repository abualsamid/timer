

const MINUTE = 60
const HOUR = 60
const pad = (n) => (n < 10 ? `0${n}` : n)

export const myFormat = ({ start, end }) => {
  const diff = Math.trunc((end - start) / 1000)
  const seconds = diff % 60
  let hours = 0
  let trueMinutes = 0
  let minutes = (diff - seconds) / MINUTE
  if (minutes > 59) {
    trueMinutes = minutes % HOUR
    hours = (minutes - trueMinutes) / HOUR
    minutes = trueMinutes
  }
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

export const CurrentLap = ({ timer }) => {
  return (
    <div>
      <strong>
        <u>** Lap {timer.laps.length + 1} **</u> : 
      </strong>{' '}
      {myFormat({
        end: Date.now(),
        start:
          timer.laps.length == 0
            ? timer.start
            : timer.laps[timer.laps.length - 1],
      })}
    </div>
  )
}


export const LastLap = ({ timer }) =>
  timer.laps.length > 0 && (
    <div>
      lap <strong> {timer.laps.length}: </strong>{' '}
      {myFormat({
        end: timer.laps[timer.laps.length - 1],
        start:
          timer.laps.length == 1
            ? timer.start
            : timer.laps[timer.laps.length - 2],
      })}
    </div>
  )

export const AllLaps = ({ timer }) =>
  timer.laps &&
  timer.laps.map((lap, i) => {
    return (
      <div key={i}>
        <strong>lap {i + 1}: </strong> {'  '}
        {myFormat({
          end: lap,
          start: i == 0 ? timer.start : timer.laps[i - 1],
        })}
      </div>
    )
  })

  export const TimerLabels = ({ timer }) => {
    return (
      <div className="row m-1">
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
        {timer.finished ? (
          <AllLaps timer={timer} />
        ) : (
          timer.started && (
            <>
              <LastLap timer={timer} />
              <CurrentLap timer={timer} />
            </>
          )
        )}
        {timer.started && (
          <p className={timer.finished ? 'fw-bold' : ''}>
            Total Time:{' '}
            {timer.started && (
              <span>
                {myFormat({
                  start: timer.start,
                  end: timer.end || Date.now(),
                })}
              </span>
            )}
          </p>
        )}
      </div>
    )
  }


export const EventTimes = ({ times }) => {
    return (
      <div className="container">
        <hr />
        <div className="row m-3">
          {times.length > 0 && <h4>Completed Times</h4>}

          {times.map((timer, i) => (
            <TimerLabels timer={timer} key={i} />
          ))}
        </div>
      </div>
    )
  }
