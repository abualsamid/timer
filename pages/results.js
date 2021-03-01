import { withAuthenticator } from '@aws-amplify/ui-react'
import { formatDuration, intervalToDuration } from 'date-fns'
import Link from 'next/link'
import { useGet } from '../lib/fetch'


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
          data.Items.map((timer) => {
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

const Results = () => (
  <>
    <nav className="navbar navbar-light bg-light">
      <div className="container-fluid">
        <Link href="/">
          <a class="navbar-brand" href="#">
            Home
          </a>
        </Link>

      </div>
    </nav>
    <HistoricalData />
  </>
)
export default withAuthenticator(Results, { usernameAlias: 'email' })
