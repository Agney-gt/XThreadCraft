import type { Metadata } from "next"
import AnalyticsDashboard from "@/components/analytics/analytics-dashboard"

export const metadata: Metadata = {
  title: "Twitter Analytics | XThreadCraft",
  description: "Comprehensive Twitter analytics dashboard for tracking engagement, followers, and tweet performance",
}

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AnalyticsDashboard />
    </div>
  )
}

