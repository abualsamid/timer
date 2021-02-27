import Layout from '@/components/layout'
import { withAuthenticator } from '@aws-amplify/ui-react'
import { unmarshall } from '@aws-sdk/util-dynamodb'
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

const HistoricalData = ({eventId}) => {
  console.log('HistoricalData ', Date.now())
  
  const historicalData = useGet(`/getTimes/${eventId}`)
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

const Home = () => {
  const [eventId, setEventId] = useState("")
  const events = useGet('/getEvents')
  console.log(events)
  const { data = {} } = events
  const { Items = [] } = data
  const items = Items.map((i) => unmarshall(i))
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
          <option value="">(Select Event)</option>
          {items.map((item) => (
            <option value={item.key}>
              {item.name} - {item.track} - {item.date}
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
