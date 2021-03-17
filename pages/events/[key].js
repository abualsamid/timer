
import { withAuthenticator } from '@aws-amplify/ui-react'
import Layout from 'components/layout'
import { useUser } from 'lib/auth'
import { useGet } from 'lib/fetch'
import { EventTimes } from 'lib/timer'
import { useRouter } from 'next/router'




const Home = () => {
  const router = useRouter()
  const user = useUser()
  const { key: eventId } = router.query

  const { data: completedTimes, mutate } = useGet(`/getTimes/${eventId}`)
  const { data: event } = useGet(`/event/${eventId}`)
  console.log('eventId ', eventId, 'completedTimes ', completedTimes, event )
  console.log('user ', user)
  return (
    <Layout user={user}>
      {event && (
        <h4 className="text-center">
          Event: {event.name || event.eventName} -
          {new Date(event.date).toLocaleString()}
        </h4>
      )}

      <br />

      {completedTimes && <EventTimes times={completedTimes.Items} />}
    </Layout>
  )
}

export default withAuthenticator(Home, { usernameAlias: 'email' })

