
import Layout from '@/components/layout'
import { useUser } from '@/lib/auth'
import { withAuthenticator } from '@aws-amplify/ui-react'
import { ulid } from 'backend/node_modules/ulid/dist'
import { useGet, usePost } from 'lib/fetch'

const Collator = new Intl.Collator('en')

const Home = () => {
  const {data:athletes, loading, error, mutate} = useGet('/getAthletes')
  const user = useUser()
  
  console.log(athletes, loading, error)
  const addAthlete = async e => {
    e.preventDefault()
    const athlete = {
      name: e.currentTarget.elements.name.value.trim(),
      key: ulid()
    }

      mutate(async athletes => {
        const item = await usePost('/athlete', athlete)
        athletes.Items = [...athletes.Items, item] 
        return athletes
      }, true)
    
    try {
      e.target.elements.name.value  = ""
    } catch (error) {
      console.error(error)
    }
    return false 
  }
  return (
    <Layout user={user}>
      <div className="container">
        {athletes && !error && !loading &&  
          athletes.Items.sort(Collator.compare).map(
            a => <div key={a.key}>{a.name}</div>
          )
        }
        <form onSubmit={addAthlete}>
          <div className="mb-3">
            <label htmlFor="name">Athlete Name</label>
            <input type="text" className="form-control" name='name'/>
          </div>
          <button type="submit" className="btn-primary">Add Athlete</button>
        </form>
      </div>
    </Layout>
  )
}
export default withAuthenticator(Home, { usernameAlias: 'email' })
