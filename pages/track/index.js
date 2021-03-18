import Layout from "@/components/layout"
import { useUser } from "@/lib/auth"
import { useGet, usePost } from "@/lib/fetch"

const reducer = (accumulator, currentValue) => 1*accumulator + 1*currentValue

const DataByAthlete = ({items, athlete}) => {

  const workouts = [...new Set(items.map(({workout}) => workout))]
  return <div>
    {
      workouts.map(
        workout => (
          <div key='workout'>
            <strong>{workout} : </strong>
            {
              items.filter(item => item.workout===workout && item.athlete===athlete).map(({value}) => value).reduce(reducer)
            }
          </div>

        )
      )
    }
  </div>
}

const DataByDate = ({ items, date }) => {
  const athletes = new Set()
  items.forEach(({athlete}) => athletes.add(athlete))

  return <div>
    {
      Array.from(athletes).map(
        athlete => (
          <div>
            <h4>{athlete}</h4>
            <DataByAthlete items={items.filter(i => i.athlete===athlete)} athlete={athlete} />
          </div>

        )
      )
    }
  </div>
}

const Track = () => {
  const user = useUser()
  const today = new Date()
    .toISOString()
    .replace(/-/g, '')
    .substring(0, 8)
  const {data: {Items:items} = {Items:[]}, mutate} = useGet(`/logItems/${today}`)
  const athletes = new Set()
  const dates = new Set() 
  items.forEach(
    ({athlete,date}) => {
      athletes.add(athlete)
      dates.add(date)
    }
  )

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
    elems.value.value=''
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
      <div className='m-auto container py-3'>
        {dates &&
          Array.from(dates).map((date) => (
            <div>
              <h4>{date}</h4>
              <DataByDate date={date} items={items
                .filter((item) => item.date == date)} />
            </div>
          ))}
      </div>
    </Layout>
  )
}


export default Track
