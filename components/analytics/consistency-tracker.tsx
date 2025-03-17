"use client"

import React from "react"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { FlameIcon as Fire } from "lucide-react"

// Generate mock data for the consistency tracker
const generateMockData = () => {
  const today = new Date()
  const data = []

  // Generate data for the last 15 weeks (105 days)
  for (let i = 104; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    // Random tweet count (0-5)
    const tweetCount = Math.floor(Math.random() * 6)

    data.push({
      date: date.toISOString().split("T")[0],
      count: tweetCount,
      day: date.getDay(),
    })
  }

  return data
}

const mockData = generateMockData()

// Calculate current streak
const calculateStreak = (data: any[]) => {
  let streak = 0
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i].count > 0) {
      streak++
    } else {
      break
    }
  }
  return streak
}

export function ConsistencyTracker() {
  const [currentStreak] = useState(calculateStreak(mockData))

  // Group data by week
  const weeks = []
  let week = []

  mockData.forEach((day, index) => {
    week.push(day)

    if (week.length === 7 || index === mockData.length - 1) {
      weeks.push([...week])
      week = []
    }
  })

  // Function to determine cell color based on tweet count
  const getCellColor = (count: number) => {
    if (count === 0) return "bg-gray-100 dark:bg-gray-800"
    if (count === 1) return "bg-blue-100 dark:bg-blue-900/30"
    if (count === 2) return "bg-blue-200 dark:bg-blue-800/40"
    if (count === 3) return "bg-blue-300 dark:bg-blue-700/50"
    if (count === 4) return "bg-blue-400 dark:bg-blue-600/60"
    return "bg-blue-500 dark:bg-blue-500/70"
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            <Fire className="h-4 w-4 mr-1 text-orange-500" />
            <span>Current streak: {currentStreak} days</span>
          </Badge>
        </div>
        <div className="flex text-xs text-muted-foreground">
          <span className="mr-1">Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-gray-100 dark:bg-gray-800"></div>
            <div className="w-3 h-3 bg-blue-100 dark:bg-blue-900/30"></div>
            <div className="w-3 h-3 bg-blue-200 dark:bg-blue-800/40"></div>
            <div className="w-3 h-3 bg-blue-300 dark:bg-blue-700/50"></div>
            <div className="w-3 h-3 bg-blue-400 dark:bg-blue-600/60"></div>
            <div className="w-3 h-3 bg-blue-500 dark:bg-blue-500/70"></div>
          </div>
          <span className="ml-1">More</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-xs">
        <div className="text-center text-muted-foreground">Sun</div>
        <div className="text-center text-muted-foreground">Mon</div>
        <div className="text-center text-muted-foreground">Tue</div>
        <div className="text-center text-muted-foreground">Wed</div>
        <div className="text-center text-muted-foreground">Thu</div>
        <div className="text-center text-muted-foreground">Fri</div>
        <div className="text-center text-muted-foreground">Sat</div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weeks.map((week, weekIndex) => (
          <React.Fragment key={weekIndex}>
            {week.map((day, dayIndex) => (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className={`aspect-square rounded-sm ${getCellColor(day.count)}`}
                title={`${day.date}: ${day.count} tweets`}
              ></div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

