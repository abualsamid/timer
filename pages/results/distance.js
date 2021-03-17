import Layout from '@/components/layout'
import { useUser } from '@/lib/auth'
import { withAuthenticator } from '@aws-amplify/ui-react'
import { useGet } from 'lib/fetch'
import { EventTimes } from 'lib/timer'
import { useState } from 'react'

const Home = () => {
  const [distance, setDistance] = useState(null)
  const { data: distances = { Items: [] } } = useGet('/getDistances')
  const { data: times } = useGet(() =>
    distance ? `/getTimeByDistance/${distance}` : null
  )
  const user=useUser()

  const selectDistance = (e) => {
    setDistance(e.currentTarget.value)
  }
  return (
    <Layout user={user}>
      <div className="container">
        <h2>Historical results by distance</h2>
        <select
          className="form-select select"
          name="eventId"
          onChange={selectDistance}
        >
          <option value="">(Select Distance)</option>
          {distances.Items.map((item) => (
            <option value={item.key} key={item.key}>
              {item.distance}
            </option>
          ))}
        </select>
        <div className="container">
          {distance && times && times.Items.length > 0 && (
            <EventTimes times={times.Items} />
          )}
        </div>
      </div>
    </Layout>
  )
}

export default withAuthenticator(Home, { usernameAlias: 'email' })
