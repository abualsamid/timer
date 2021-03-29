import Layout from "@/components/layout"
import { useUser } from "@/lib/auth"
import { useGet, usePost } from "@/lib/fetch"
import { useState } from "react"

const reducer = (accumulator, currentValue) => 1*accumulator + 1*currentValue

const DataByAthlete = ({items, athlete, date, counter}) => {

  const workouts = [...new Set(items.map(({workout}) => workout))]
  return (
    <div className='my-3'>
      {workouts.map((workout) => (
        <div className="row" key={workout}>
          <div className="col">
            <strong>{workout} : </strong>
            {items
              .filter(
                (item) =>
                  item.workout === workout &&
                  item.athlete === athlete &&
                  item.date === date
              )
              .map(({ value }) => value)
              .reduce(reducer, 0)}{' '}
          </div>
          <div className="col">
            {counter == '0' && (
              <strong className="mx-4 px-4">
                {items
                  .filter(
                    (item) =>
                      item.workout === workout && item.athlete === athlete
                  )
                  .map(({ value }) => value)
                  .reduce(reducer, 0)
                  .toFixed(2)}
              </strong>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

const DataByDate = ({ items, date, counter }) => {
  const athletes = [...new Set(items.map(({ athlete }) => athlete))]

  return (
    <div>
      {[...athletes].map((athlete,i) => (
        <div key={i}>
          <h4>{athlete}</h4>
          <DataByAthlete
            items={items.filter((i) => i.athlete === athlete)}
            athlete={athlete}
            date={date}
            counter={counter}
          />
        </div>
      ))}
    </div>
  )
}

const pad = n => n<10?`0${n}`:n
const displayDate= (date) => `${date.substring(0,4)}-${date.substring(4,6)}-${date.substring(6,8)}`
const Track = () => {
  const [disabled, setDisabled] = useState("")
  const [message, setMessage] = useState("")
  const user = useUser()
  const Now = new Date()
  const year = Now.getFullYear()
  const month = Now.getMonth()+1
  const day = Now.getDate()
  const today = `${year}${pad(month)}${pad(day)}`
  const {data: {Items:items} = {Items:[]}, mutate} = useGet(`/logItems/${today}`)
  const athletes = new Set([...items.map(({athlete})=>athlete)])
  const dates = new Set([...items.map(({ date }) => date)]) 
  

  const onSubmit = async e => {
    e.preventDefault()
    setDisabled("disabled")
    const elems = e.currentTarget.elements
    const athlete = elems.athlete.value.trim() || "me"
    const workout = elems.workout.value.trim()
    const value = elems.value.value.trim()
    const data = {
      athlete,
      workout,
      value,
      
    }
    setMessage(`*** ${athlete} - ${workout} - ${value} ***`)
    const res = await usePost('logItem', data)
    mutate()
    console.log(res)
    elems.value.value=''
    setDisabled("")
    return false
  }
  return (
    <Layout user={user}>
      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            name="athlete"
            id="athlete"
            placeholder="Athlete Name"
            autoComplete="off"
          />
        </div>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            name="workout"
            id="workout"
            placeholder="Workout"
            autoComplete="off"
          />
        </div>
        <div className="mb-3">
          <input
            className="form-control"
            name="value"
            id="value"
            type="number"
						step="any"
            placeholder="Value"
            autoComplete="off"
          />
        </div>

        <div className="d-grid gap-2">
          <button
            type="submit"
            className={`btn btn-primary btn-lg ${disabled}`}
          >
            Log Item
          </button>
        </div>
      </form>
      <br />
      {message && <div className="m-auto container">{message}</div>}
      <div className="m-auto container py-3">
        {dates &&
          Array.from(dates).map((date, i) => (
            <div key={i}>
              <h4>{date && displayDate(date)}</h4>
              <DataByDate
                date={date}
                counter={i}
                items={items}
              />
              <hr/>
            </div>
          ))}
      </div>
    </Layout>
  )
}


export default Track
