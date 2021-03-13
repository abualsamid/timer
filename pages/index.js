import Layout from '@/components/layout'
import Link from 'next/link'



const Home = () => {
  return (
    <Layout>
      <div className="container-fluid text-center m-2 p-2">
        Use the{' '}
        <Link href="/events/express">
          <a>
            Timer{' '}
            <i className="bi-alarm" style={{ color: 'cornflowerblue' }}></i>
          </a>
        </Link>{' '}
        to time athletes.
        <br />
        Registered users{' '}
        <Link href="/login">
          <a className="navbar-brand" >
            <i className="bi-person" style={{ color: 'red' }}></i>
          </a>
        </Link>
        can save results to the cloud, view historical {' '}
        <Link href="/results/event">
          <a className="navbar-brand" >
            <i
              className="bi-journal-text"
              style={{  color: 'green' }}
            ></i>
          </a>
        </Link>
        results and track other workouts
      </div>
    </Layout>
  )
}
export default Home