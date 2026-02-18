import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import DashboardCharts from '@/customComponents/dashboardCharts';
import Header from '@/customComponents/Header';


function Dashboard() {
  const [food, setFood] = useState("")
  const [store, setStore] = useState([])
  const [addedFoods, setAddedFoods] = useState([])
  const [chartData, setChartData] = useState([])
  const [historicalData, setHistoricalData] = useState([])

  const getTodayStats = (decoded) => {
    fetch(`/api/userFood/todayStats/${decoded.id}`)
      .then((res) => res.json())
      .then((chartData) => setChartData(chartData.map((chartEntry) => ({
        ...chartEntry,
        fill: `var(--color-${chartEntry.name})`
      }))))

    fetch(`/api/userFood/historicalData/${decoded.id}/1week`)
      .then((res) => res.json())
      .then((chartData) => setHistoricalData(chartData))
  }

  useEffect(() => {
    const decoded = JSON.parse(sessionStorage.getItem("decoded") ?? '')

    fetch(`/api/userFood/${decoded.id}`)
      .then((res) => res.json())
      .then((addedFoods) => setAddedFoods(addedFoods ?? []))

    getTodayStats(decoded)

  }, [])

  const handleFood = async (text: string) => {
    const res = await fetch("/api/search/" + text, {
      method: 'GET'
    })

    try {
      const data = await res.json()
      if (data === null) {
        setStore([])
      }
      else {
        setStore(data)
      }
    } catch (error) {
      setStore([])
      console.log("error")
    }

  }

  const [selectedFood, setSelectedFood] = useState<number | null>(null)
  const [foodQuantity, setFoodQuantity] = useState(0)

  const addFood = async () => {
    const decoded = JSON.parse(sessionStorage.getItem("decoded") ?? '')
    const res = await fetch("/api/userFood", {
      method: "POST",
      body: JSON.stringify({
        userId: decoded.id,
        foodId: String(selectedFood),
        foodQuantity: foodQuantity,
      })
    })
    const content = await res.json()
    setAddedFoods(content)

    getTodayStats(decoded)
  }

  const handleSelection = (selectedId: number, selectedDescription: string) => {
    setSelectedFood(selectedId)
    setStore([])
    setFood(selectedDescription)
  }

  return (
    <>
      <Header />
      <div className='flex gap-1 p-2'>
        <Card className='w-1/2'>
          <CardContent>
            <div>
              <Label htmlFor="foodName"> Food Name </Label>
              <Input id="foodName" name="Search" value={food} onChange={(event) => {
                setFood(event.target.value)
                handleFood(event.target.value)
              }} />
            </div>
            <div >
              {
                store.map((lm) =>
                  <div className='hover:bg-sky-700 cursor-pointer transition duration-200'
                    id={lm.id}
                    onClick={async () => handleSelection(lm.id, lm.description)}> {lm.description}
                  </div>)
              }
            </div>
            <div>
              <Label htmlFor="quantity"> quantity </Label>
              <Input
                id="quantity"
                type='number'
                value={foodQuantity}
                onChange={(event) => setFoodQuantity(Number(event.target.value))} />
            </div>
            <Button className='mt-2' onClick={() => addFood()}> Add </Button>
          </CardContent>
        </Card>

        <Card className='w-1/2 max-h-60 overflow-auto'>
          <CardContent>
            {addedFoods.map((food, index) => {
              return (
                <div key={index}>{food.foodName} x {food.timesAdded}</div>
              )
            })}
          </CardContent>
        </Card>

      </div>

      <DashboardCharts chartData={chartData} historicalData={historicalData} setHistoricalData={setHistoricalData} />
    </>
  )

}

export default Dashboard;
