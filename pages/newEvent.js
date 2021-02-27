
import { withAuthenticator } from '@aws-amplify/ui-react'
import Layout from 'components/layout'
import { usePost } from 'lib/fetch'
import { useRouter } from 'next/router'


const Home = () => {
  const router = useRouter() 
  
  const createEvent = async e => {
    e.preventDefault()

    const elems = e.currentTarget.elements 
    const track = elems.trackId.value || elems.trackName.value.trim()
    const notes = elems.notes.value.trim()
    const eventName = elems.eventName.value.trim()
    const data = {
      track,
      notes ,
      eventName,
      date: new Date()
    }
    const res = await usePost('createEvent', data)
    console.log(res)
    router.push(`/events/${res.Item.key}`)
    return false 
  }
  console.log(Date.now())
  return (
    <Layout>
      <div className="container">
        <h3 className="text-center">Create New Event</h3>
        <form onSubmit={createEvent}>
          <div className="mb-3">
            <label htmlFor="eventName">Event Name</label>
            <input type="text" className="form-control" name="eventName" />
          </div>
          <div className="mb-3">
            <label htmlFor="trackId">Track</label>
            <select
              name="trackId"
              id="trackId"
              className="form-select form-select-lg my-3"
            >
              <option value="">(Add New Track)</option>
            </select>
            <input type="text" name="trackName" className="form-control" />
          </div>
          <div className="mb-3">
            <label htmlFor="notes">Notes</label>
            <input type="text" className="form-control" name="notes" />
          </div>
          <div className="d-grid">
            <button className="btn btn-primary" type='submit'>Add Event</button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
export default withAuthenticator(Home, { usernameAlias: 'email' })
