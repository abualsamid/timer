import { withAuthenticator } from '@aws-amplify/ui-react'
import Link from 'next/link'



const Home = () => {
  return (
    <div className="container my-3">
      <div className="container">
        <div className="card  p-3">
          <h3 className="text-center">Timer</h3>
          <br />
          <span>Time athletes without any setup</span>

          <Link href="/events/express">
            <a href="" className="d-block btn btn-block btn-primary p-2 m-2">
              Express Timing
            </a>
          </Link>
          <br />
          <span>Create and Manage Events</span>
          <Link href="/newEvent">
            <a className="btn btn-block btn-primary m-2 p-2">New Event</a>
          </Link>
          <Link href="/events">
            <a className="btn btn-block btn-primary  m-2 p-2">Access Events</a>
          </Link>
        </div>

        <h3>Setup Athletes</h3>
        <div className="d-grid gap-4">
          <Link href="/athletes">
            <a href="" className="btn btn-block btn-outline-primary">
              Setup Athletes
            </a>
          </Link>
        </div>
      </div>
      <div className="container my-3">
        <h3>Results</h3>
        <div className="d-grid gap-4">
          <button className="btn btn-block btn-outline-primary">
            <Link href="/results/event">
              <a>Historical Results By Event</a>
            </Link>
          </button>
          <button className="btn btn-block btn-outline-secondary">
            <Link href="/results/athlete">
              <a>Historical Results By Athlete</a>
            </Link>
          </button>
          <button className="btn btn-block btn-outline-danger">
            <Link href="/results/distance">
              <a>Historical Results By Distance</a>
            </Link>
          </button>
        </div>
      </div>
    </div>
  )
}
export default withAuthenticator(Home, {usernameAlias: 'email'})