import Layout from '@/components/layout'
import { withAuthenticator } from '@aws-amplify/ui-react'
import { formatDuration, intervalToDuration } from 'date-fns'
import { useGet } from 'lib/fetch'
import { useState } from 'react'


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
            <div key={i}>
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

const HistoricalData = ({eventId}) => {
  
  const {data} = useGet(`/getTimes/${eventId}`)
  return (
    <div className="container">
      <h2>Historical results by event</h2>

      <div className="row m-3">
        {data &&
          data.Items &&
          data.Items.length > 0 &&
          data.Items.map((timer, i) => {
            return (
              <>
                <TimerLables timer={timer} key={i} />
                <hr />
              </>
            )
          })}
      </div>
    </div>
  )
}

const Home = () => {
  const [eventId, setEventId] = useState("")
  const { data: { Items:items = []} = {Items:[]} } = useGet('/getEvents')
  // const { data = { Items: [] } } = events
  // const { Items: items = [] } = data 
  console.log('Home ', Date.now())
  
  const selectEvent = e => setEventId(e.currentTarget.value)
  return (
    <Layout>
      <div className="container">
        <h2>Historical results</h2>
        <select
          className="form-select select"
          name="eventId"
          onChange={selectEvent}
        >
          <option value="" key='0'>(Select Event)</option>
          {items && items.map((item) => (
            <option value={item.key} key={item.key}>
              {item.name || item.eventName } - {item.track} - {item.date}
            </option>
          ))}
        </select>
        <div className="container">
          {eventId && <HistoricalData eventId={eventId} />}
        </div>
      </div>
    </Layout>
  )
}

export default withAuthenticator(Home, { usernameAlias: 'email' })
