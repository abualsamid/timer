import Layout from '@/components/layout'
import { withAuthenticator } from '@aws-amplify/ui-react'
import { useGet } from 'lib/fetch'
import Link from 'next/link'

const Collator = new Intl.Collator('en')

const Home = () => {
  const { data: events, loading, error } = useGet('/getEvents')
  console.log(events)
  
  return (
    <Layout>
      <div className="container">
        <h3 className="text-center">Events</h3>
        <p>
          Select an event to view completed times or to time new races.
        </p>
        {events && !error && !loading && (
          <ul>
            {events.Items.sort(Collator.compare).map((a) => (
              <li key={a.key}>
                <Link href={`/events/${a.key}`}>
                  <a>
                    {a.name || a.eventName} :{new Date(a.date).toLocaleString()}{' '}
                    - {a.notes}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  )
}
export default withAuthenticator(Home, { usernameAlias: 'email' })
