import Layout from "@/components/layout"
import { useUser } from "@/lib/auth"
import { useGet, usePost } from "@/lib/fetch"
const Track = () => {
  const user = useUser()
  const today = new Date()
    .toISOString()
    .replace(/-/g, '')
    .substring(0, 8)
  const {data: {Items:items} = {Items:[]}, mutate} = useGet(`/logItems/${today}`)
  
  const onSubmit = async e => {
    e.preventDefault()
    const elems = e.currentTarget.elements
    const athlete = elems.athlete.value.trim() || "me"
    const workout = elems.workout.value.trim()
    const value = elems.value.value.trim()
    const data = {
      athlete,
      workout,
      value,
      
    }
    const res = await usePost('logItem', data)
    mutate()
    console.log(res)
    return false
  }
  return (
    <Layout user={user}>
      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            className="form-control"
            name="athlete"
            id="athlete"
            type="text"
            placeholder="Athlete Name"
            autoComplete="off"
          />
        </div>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            className="form-control"
            name="workout"
            id="workout"
            type="text"
            placeholder="Workout"
            autoComplete="off"
          />
        </div>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            className="form-control"
            name="value"
            id="value"
            type="text"
            placeholder="Value"
            autoComplete="off"
          />
        </div>

        <div className="d-grid gap-2">
          <button type="submit" className="btn btn-primary btn-lg">
            Log Item
          </button>
        </div>
      </form>
      <div>
        
        {
          items.map(
            ({athlete, workout, date, day, value, key}) => <div>
              {athlete} : {date} : {day} 
              <br/>
              {workout} : {value}
            </div>
            
              
          )
        }
      </div>
    </Layout>
  )
}


export default Track
