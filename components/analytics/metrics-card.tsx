import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Heart, MessageCircle, Repeat, TrendingDown, TrendingUp } from "lucide-react"

interface MetricsCardProps {
  value: number
  change: number
}

export function ImpressionsCard({ value, change }: MetricsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Impressions</CardTitle>
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        <div className="flex items-center text-xs text-muted-foreground">
          {change > 0 ? (
            <>
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              <span className="text-green-500">{change.toFixed(1)}% increase</span>
            </>
          ) : change < 0 ? (
            <>
              <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
              <span className="text-red-500">{Math.abs(change).toFixed(1)}% decrease</span>
            </>
          ) : (
            <span>No change</span>
          )}
          <span className="ml-1">from previous period</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function LikesCard({ value, change }: MetricsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Likes</CardTitle>
        <Heart className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        <div className="flex items-center text-xs text-muted-foreground">
          {change > 0 ? (
            <>
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              <span className="text-green-500">{change.toFixed(1)}% increase</span>
            </>
          ) : change < 0 ? (
            <>
              <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
              <span className="text-red-500">{Math.abs(change).toFixed(1)}% decrease</span>
            </>
          ) : (
            <span>No change</span>
          )}
          <span className="ml-1">from previous period</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function RetweetsCard({ value, change }: MetricsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Retweets</CardTitle>
        <Repeat className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        <div className="flex items-center text-xs text-muted-foreground">
          {change > 0 ? (
            <>
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              <span className="text-green-500">{change.toFixed(1)}% increase</span>
            </>
          ) : change < 0 ? (
            <>
              <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
              <span className="text-red-500">{Math.abs(change).toFixed(1)}% decrease</span>
            </>
          ) : (
            <span>No change</span>
          )}
          <span className="ml-1">from previous period</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function RepliesCard({ value, change }: MetricsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Replies</CardTitle>
        <MessageCircle className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        <div className="flex items-center text-xs text-muted-foreground">
          {change > 0 ? (
            <>
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              <span className="text-green-500">{change.toFixed(1)}% increase</span>
            </>
          ) : change < 0 ? (
            <>
              <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
              <span className="text-red-500">{Math.abs(change).toFixed(1)}% decrease</span>
            </>
          ) : (
            <span>No change</span>
          )}
          <span className="ml-1">from previous period</span>
        </div>
      </CardContent>
    </Card>
  )
}


