"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface MetricsChartProps {
  data: { date: string; impressions: number; likes: number; retweets: number; replies: number }[]
  title: string
  description: string
}

export function MetricsChart({ data, title, description }: MetricsChartProps) {
  // Format date for display
  const formattedData = data.map((item) => ({
    ...item,
    formattedDate: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="line">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="line">Line</TabsTrigger>
              <TabsTrigger value="bar">Bar</TabsTrigger>
              <TabsTrigger value="area">Area</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="line" className="h-[350px]">
            <ChartContainer
              config={{
                impressions: {
                  label: "Impressions",
                  color: "hsl(var(--chart-1))",
                },
                likes: {
                  label: "Likes",
                  color: "hsl(var(--chart-2))",
                },
                retweets: {
                  label: "Retweets",
                  color: "hsl(var(--chart-3))",
                },
                replies: {
                  label: "Replies",
                  color: "hsl(var(--chart-4))",
                },
              }}
              className="h-full"
            >
              <LineChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="formattedDate" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={40} />
                <Line
                  type="monotone"
                  dataKey="impressions"
                  stroke="var(--color-impressions)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="likes"
                  stroke="var(--color-likes)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="retweets"
                  stroke="var(--color-retweets)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="replies"
                  stroke="var(--color-replies)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
              </LineChart>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="bar" className="h-[350px]">
            <ChartContainer
              config={{
                impressions: {
                  label: "Impressions",
                  color: "hsl(var(--chart-1))",
                },
                likes: {
                  label: "Likes",
                  color: "hsl(var(--chart-2))",
                },
                retweets: {
                  label: "Retweets",
                  color: "hsl(var(--chart-3))",
                },
                replies: {
                  label: "Replies",
                  color: "hsl(var(--chart-4))",
                },
              }}
              className="h-full"
            >
              <BarChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="formattedDate" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={40} />
                <Bar dataKey="impressions" fill="var(--color-impressions)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="likes" fill="var(--color-likes)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="retweets" fill="var(--color-retweets)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="replies" fill="var(--color-replies)" radius={[4, 4, 0, 0]} />
                <ChartTooltip content={<ChartTooltipContent />} />
              </BarChart>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="area" className="h-[350px]">
            <ChartContainer
              config={{
                impressions: {
                  label: "Impressions",
                  color: "hsl(var(--chart-1))",
                },
                likes: {
                  label: "Likes",
                  color: "hsl(var(--chart-2))",
                },
                retweets: {
                  label: "Retweets",
                  color: "hsl(var(--chart-3))",
                },
                replies: {
                  label: "Replies",
                  color: "hsl(var(--chart-4))",
                },
              }}
              className="h-full"
            >
              <AreaChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="formattedDate" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={40} />
                <Area
                  type="monotone"
                  dataKey="impressions"
                  stroke="var(--color-impressions)"
                  fill="var(--color-impressions)"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="likes"
                  stroke="var(--color-likes)"
                  fill="var(--color-likes)"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="retweets"
                  stroke="var(--color-retweets)"
                  fill="var(--color-retweets)"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="replies"
                  stroke="var(--color-replies)"
                  fill="var(--color-replies)"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
              </AreaChart>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

