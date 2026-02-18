import { Card, CardContent, CardHeader } from "@/components/ui/card"
import DailyChart from "./DailyChart"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { chartConfig, domains, histConf } from "@/utils/constants"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

function DashboardCharts({ chartData, historicalData, setHistoricalData }) {

  const fetchHistoricalData = (period: string) => {
    const decoded = JSON.parse(sessionStorage.getItem("decoded") ?? '')

    fetch(`/api/userFood/historicalData/${decoded.id}/${period}`)
      .then((res) => res.json())
      .then((chartData) => setHistoricalData(chartData))

  }

  return (
    <div className='flex gap-1 p-2'>
      <Card className='w-1/2'>
        <CardHeader>
          <div className='font-bold text-center'>
            Macros
          </div>
        </CardHeader>
        <CardContent>
          <DailyChart chartData={chartData} chartConfig={chartConfig} domains={domains} />
        </CardContent>
      </Card>

      <Card className='w-1/2'>
        <CardHeader>
          <div className="flex justify-between">
            <div className='font-bold text-center'>
              Calories per day
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="outline">Settings</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => fetchHistoricalData('1week')}>1 Week</DropdownMenuItem>
                <DropdownMenuItem onClick={() => fetchHistoricalData('2week')}>2 Weeks</DropdownMenuItem>
                <DropdownMenuItem onClick={() => fetchHistoricalData('1month')}>1 Month</DropdownMenuItem>
                <DropdownMenuItem onClick={() => fetchHistoricalData('5month')}>5 Months</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={histConf}>
            <BarChart accessibilityLayer data={historicalData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="value" fill="var(--color-desktop)" radius={8} />
            </BarChart>
          </ChartContainer>

        </CardContent>
      </Card>

    </div>

  )
}

export default DashboardCharts
