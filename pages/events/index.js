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
        {events &&
          !error &&
          !loading &&
          events.Items.sort(Collator.compare).map((a) => (
            <div key={a.key}>
              <Link href={`/events/${a.key}`}>
                <a>
                  {a.name || a.eventName} : 
                  {new Date(a.date).toLocaleString()} - {a.notes}
                </a>
              </Link>
            </div>
          ))}
      </div>
    </Layout>
  )
}
export default withAuthenticator(Home, { usernameAlias: 'email' })
