import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LabelList, PolarAngleAxis, RadialBar, RadialBarChart } from "recharts"

function DailyChart({ chartData, chartConfig, domains }) {

  return (
    <ChartContainer config={chartConfig}
      className="mx-auto aspect-square max-h-[350px]"
    >
      <RadialBarChart
        data={chartData}
        startAngle={-90}
        endAngle={380}
        innerRadius={90}
        outerRadius={1000}
      >
        {
          chartData.map((data, index) => (<>
            <RadialBar angleAxisId={index} dataKey="value" background data={[data]} >
              <LabelList
                position="insideStart"
                dataKey="name"
                className="fill-white capitalize mix-blend-luminosity"
                fontSize={11}
              />
            </RadialBar>
            <PolarAngleAxis type="number" domain={domains[index]} angleAxisId={index} tick={false} />
          </>))
        }
      </RadialBarChart>
    </ChartContainer>

  )
}

export default DailyChart
