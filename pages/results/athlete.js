import Layout from '@/components/layout'
import { useUser } from '@/lib/auth'
import { withAuthenticator } from '@aws-amplify/ui-react'
import { useGet } from 'lib/fetch'
import { EventTimes } from 'lib/timer'
import { useState } from 'react'



const Home = () => {
  const [athleteId, setAthleteId] = useState(null)
  const { data: athletes = { Items: [] } } = useGet('/getAthletes')
  const { data: times } = useGet(() =>
    athleteId ? `/getTimeByAthlete/${athleteId}` : null
  )
  const user = useUser()
  console.log(athletes, times )
  console.log('Res by Athlete ', Date.now())

  const selectAthlete = e => {
    setAthleteId(e.currentTarget.value)
  }
  return (
    <Layout user={user}>
      <div className="container">
        <h2>Historical results by athlete</h2>
        <select
          className="form-select select"
          name="eventId"
          onChange={selectAthlete}
        >
          <option value="">(Select Athlete)</option>
          { athletes.Items.map((item) => (
              <option value={item.key} key={item.key}>
                {item.name} - {item.track} - {item.date}
              </option>
            ))}
        </select>
        <div className="container">
          {athleteId && times && times.Items.length>0 && <EventTimes times={times.Items} />}
        </div>
      </div>
    </Layout>
  )
}

export default withAuthenticator(Home, { usernameAlias: 'email' })
