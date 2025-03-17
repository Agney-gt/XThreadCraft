"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// Mock data for the engagement hours chart
const data = [
  { hour: "12am", impressions: 120 },
  { hour: "1am", impressions: 80 },
  { hour: "2am", impressions: 60 },
  { hour: "3am", impressions: 40 },
  { hour: "4am", impressions: 30 },
  { hour: "5am", impressions: 50 },
  { hour: "6am", impressions: 90 },
  { hour: "7am", impressions: 150 },
  { hour: "8am", impressions: 280 },
  { hour: "9am", impressions: 450 },
  { hour: "10am", impressions: 620 },
  { hour: "11am", impressions: 750 },
  { hour: "12pm", impressions: 830 },
  { hour: "1pm", impressions: 920 },
  { hour: "2pm", impressions: 970 },
  { hour: "3pm", impressions: 890 },
  { hour: "4pm", impressions: 820 },
  { hour: "5pm", impressions: 750 },
  { hour: "6pm", impressions: 680 },
  { hour: "7pm", impressions: 590 },
  { hour: "8pm", impressions: 470 },
  { hour: "9pm", impressions: 380 },
  { hour: "10pm", impressions: 290 },
  { hour: "11pm", impressions: 210 },
]

export function EngagementHoursChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 10,
            left: 10,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="hour"
            tickLine={false}
            axisLine={false}
            padding={{ left: 10, right: 10 }}
            tick={{ fontSize: 12 }}
            interval={3}
          />
          <YAxis tickLine={false} axisLine={false} width={40} domain={[0, "auto"]} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-muted-foreground">{payload[0].payload.hour}</span>
                        <span className="font-bold">{payload[0].value} impressions</span>
                      </div>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          <Bar dataKey="impressions" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

