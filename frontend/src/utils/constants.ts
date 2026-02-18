const domains = [[0, 2500], [0, 100], [0, 160], [0, 20], [0, 100]]

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  kilocalories: {
    label: "Kilocalories",
    color: "hsl(var(--chart-1))",
  },
  carbohydrate: {
    label: "Carbohydrate",
    color: "hsl(var(--chart-2))",
  },
  lipid: {
    label: "Lipid",
    color: "hsl(var(--chart-3))",
  },
  protein: {
    label: "Protein",
    color: "hsl(var(--chart-4))",
  },
  sugar: {
    label: "Sugar",
    color: "hsl(var(--chart-5))",
  },
}

const histConf = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
}

export { domains, chartConfig, histConf }
