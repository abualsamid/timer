import Layout from '@/components/layout'
import { withAuthenticator } from '@aws-amplify/ui-react'
import { useGet } from 'lib/fetch'
import { EventTimes } from 'lib/timer'
import { useState } from 'react'



const Home = () => {
  const [athleteId, setAthleteId] = useState('')
  const { data: athletes = { Items: [] } } = useGet('/getAthletes')

  console.log(athletes)
  console.log('Res by Athlete ', Date.now())

  const selectEvent = (e) => setAthleteId(e.currentTarget.value)
  return (
    <Layout>
      <div className="container">
        <h2>Historical results</h2>
        <select
          className="form-select select"
          name="eventId"
          onChange={selectEvent}
        >
          <option value="">(Select Athlete)</option>
          { athletes.Items.map((item) => (
              <option value={item.key}>
                {item.name} - {item.track} - {item.date}
              </option>
            ))}
        </select>
        <div className="container">
          {athleteId && <EventTimes athleteId={athleteId} />}
        </div>
      </div>
    </Layout>
  )
}

export default withAuthenticator(Home, { usernameAlias: 'email' })
