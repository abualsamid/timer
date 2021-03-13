import Layout from '@/components/layout'
import Link from 'next/link'



const Home = () => {
  return (
    <Layout >
      <div className="container-fluid text-center m-2 p-2">
        Use the {' '}
        <Link href="/events/express">
          <a>
            Timer
          </a>
        </Link> to time athletes.
        <br />
        Registered users can save results to the cloud, view historical results and track other workouts        
      </div>
      
     
    </Layout>
  )
}
export default Home