import Layout from '@/components/layout'
import Link from 'next/link'



const Home = () => {
  
  return (
    <Layout>
        <div className="m-2 p-2" style={{border: '1px'}}>
          <span>
            Time athletes without any setup - results are not saved in database
          </span>
          <Link href="/events/express">
            <a href="" className="d-block btn btn-lg btn-primary p-2 m-2">
              Timer
            </a>
          </Link>
          <br />
        </div>

        <div className="card m-2 p-2">
          <div className="card-body">
            <h5 className="card-title">
              Advanced Features (require free account)
            </h5>
            <br />

            <div className="card-text d-grid gap-3 col-6 mx-auto">
              <Link href="/athletes">
                <a className="btn btn-primary btn-lg p-auto">
                  Add Athletes
                  <br />
                  <small>add athlete names to track their times</small>
                </a>
              </Link>
              <Link href="/newEvent">
                <a className="btn btn-lg btn-primary">
                  Create New Event
                  <br />
                  <small>create an event and time athletes and races</small>
                </a>
              </Link>
              <Link href="/events">
                <a className="btn btn-lg btn-primary">
                  Access Past Events
                  <br />
                  <small>
                    Access recent events, to view results or to time new races
                  </small>
                </a>
              </Link>
              <Link href="/results/event">
                <a className="btn btn-lg btn-primary">
                  Historical Results By Event
                </a>
              </Link>
              <Link href="/results/athlete">
                <a className="btn btn-lg btn-primary">
                  Historical Results By Athlete
                </a>
              </Link>
              <Link href="/results/distance">
                <a className="btn btn-lg btn-primary">
                  Historical Results By Distance
                </a>
              </Link>
            </div>
          </div>
        </div>
    </Layout>
  )
}
export default Home