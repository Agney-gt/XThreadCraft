"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Filter, Trash2, MessageCircle, Heart, RefreshCw, Search } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

interface Thread {
  id: string
  title: string
  content: string
  createdAt: string
  tweetCount: number
  metrics?: {
    likes: number
    replies: number
    retweets: number
  }
}

export function ThreadManager() {
  const { data: session } = useSession()
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedThreads, setSelectedThreads] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({
    likes: { min: "", max: "", active: false },
    replies: { min: "", max: "", active: false },
    tweetCount: { min: "", max: "", active: false },
  })
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Fetch threads from API
  useEffect(() => {
    const fetchThreads = async () => {
      try {
        // In a real implementation, you would fetch threads from your API
        // const response = await fetch('/api/threads');
        // const data = await response.json();
        // setThreads(data);

        // For now, we'll just set an empty array
        setThreads([])
      } catch (error) {
        console.error("Error fetching threads:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchThreads()
  }, [])

  // Filter threads based on search and filters
  const filteredThreads = threads.filter((thread) => {
    // Search filter
    const matchesSearch =
      thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.content.toLowerCase().includes(searchQuery.toLowerCase())

    // Likes filter
    const matchesLikes =
      !filters.likes.active ||
      (thread.metrics?.likes !== undefined &&
        (filters.likes.min === "" || thread.metrics.likes >= Number.parseInt(filters.likes.min)) &&
        (filters.likes.max === "" || thread.metrics.likes <= Number.parseInt(filters.likes.max)))

    // Replies filter
    const matchesReplies =
      !filters.replies.active ||
      (thread.metrics?.replies !== undefined &&
        (filters.replies.min === "" || thread.metrics.replies >= Number.parseInt(filters.replies.min)) &&
        (filters.replies.max === "" || thread.metrics.replies <= Number.parseInt(filters.replies.max)))

    // Tweet count filter
    const matchesTweetCount =
      !filters.tweetCount.active ||
      ((filters.tweetCount.min === "" || thread.tweetCount >= Number.parseInt(filters.tweetCount.min)) &&
        (filters.tweetCount.max === "" || thread.tweetCount <= Number.parseInt(filters.tweetCount.max)))

    return matchesSearch && matchesLikes && matchesReplies && matchesTweetCount
  })

  const toggleThreadSelection = (threadId: string) => {
    setSelectedThreads((prev) => (prev.includes(threadId) ? prev.filter((id) => id !== threadId) : [...prev, threadId]))
  }

  const selectAllThreads = () => {
    if (selectedThreads.length === filteredThreads.length) {
      setSelectedThreads([])
    } else {
      setSelectedThreads(filteredThreads.map((thread) => thread.id))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedThreads.length === 0) return

    setIsDeleting(true)
    try {
      const response = await fetch("/api/thread/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userAccessToken: session?.user?.accessToken,
          userAccessSecret: session?.user?.accessSecret,
          threadIds: selectedThreads,
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Remove deleted threads from state
        setThreads(threads.filter((thread) => !selectedThreads.includes(thread.id)))

        toast({
          title: "Threads deleted",
          description: `Successfully deleted ${result.deleted.length} threads.`,
        })

        // If there are any failed deletes, show them
        if (result.failed && result.failed.length > 0) {
          toast({
            title: "Some threads couldn't be deleted",
            description: `Failed to delete ${result.failed.length} threads.`,
            variant: "destructive",
          })
        }

        // Clear selection
        setSelectedThreads([])
      } else {
        throw new Error(result.error || "Failed to delete threads")
      }
    } catch (error) {
      console.error("Error deleting threads:", error)
      toast({
        title: "Error",
        description: "Failed to delete threads. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const resetFilters = () => {
    setFilters({
      likes: { min: "", max: "", active: false },
      replies: { min: "", max: "", active: false },
      tweetCount: { min: "", max: "", active: false },
    })
    setIsFilterOpen(false)
  }

  const activeFilterCount =
    (filters.likes.active ? 1 : 0) + (filters.replies.active ? 1 : 0) + (filters.tweetCount.active ? 1 : 0)

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-5 bg-muted rounded w-1/3"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-muted rounded w-full mb-2"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardContent>
            <CardFooter>
              <div className="h-4 bg-muted rounded w-1/4"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Threads</h2>

        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <Badge variant="secondary">
              {activeFilterCount} {activeFilterCount === 1 ? "filter" : "filters"}
            </Badge>
          )}

          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={activeFilterCount > 0 ? "border-blue-500" : ""}>
                <Filter className="h-4 w-4 mr-1" />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Filter Threads</h4>
                  <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 px-2 text-xs">
                    Reset
                  </Button>
                </div>

                {/* Likes filter */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="filter-likes"
                        checked={filters.likes.active}
                        onCheckedChange={(checked) =>
                          setFilters((prev) => ({
                            ...prev,
                            likes: { ...prev.likes, active: !!checked },
                          }))
                        }
                        className="data-[state=checked]:bg-red-500"
                      />
                      <label htmlFor="filter-likes" className="text-sm flex items-center">
                        <Heart className="h-3 w-3 mr-1 text-red-500" /> Likes
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        type="number"
                        placeholder="Min"
                        disabled={!filters.likes.active}
                        value={filters.likes.min}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            likes: { ...prev.likes, min: e.target.value },
                          }))
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        type="number"
                        placeholder="Max"
                        disabled={!filters.likes.active}
                        value={filters.likes.max}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            likes: { ...prev.likes, max: e.target.value },
                          }))
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Replies filter */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="filter-replies"
                        checked={filters.replies.active}
                        onCheckedChange={(checked) =>
                          setFilters((prev) => ({
                            ...prev,
                            replies: { ...prev.replies, active: !!checked },
                          }))
                        }
                        className="data-[state=checked]:bg-blue-500"
                      />
                      <label htmlFor="filter-replies" className="text-sm flex items-center">
                        <MessageCircle className="h-3 w-3 mr-1 text-blue-500" /> Replies
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        type="number"
                        placeholder="Min"
                        disabled={!filters.replies.active}
                        value={filters.replies.min}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            replies: { ...prev.replies, min: e.target.value },
                          }))
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        type="number"
                        placeholder="Max"
                        disabled={!filters.replies.active}
                        value={filters.replies.max}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            replies: { ...prev.replies, max: e.target.value },
                          }))
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Tweet count filter */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="filter-tweet-count"
                        checked={filters.tweetCount.active}
                        onCheckedChange={(checked) =>
                          setFilters((prev) => ({
                            ...prev,
                            tweetCount: { ...prev.tweetCount, active: !!checked },
                          }))
                        }
                        className="data-[state=checked]:bg-green-500"
                      />
                      <label htmlFor="filter-tweet-count" className="text-sm flex items-center">
                        <MessageCircle className="h-3 w-3 mr-1 text-green-500" /> Tweet Count
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        type="number"
                        placeholder="Min"
                        disabled={!filters.tweetCount.active}
                        value={filters.tweetCount.min}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            tweetCount: { ...prev.tweetCount, min: e.target.value },
                          }))
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        type="number"
                        placeholder="Max"
                        disabled={!filters.tweetCount.active}
                        value={filters.tweetCount.max}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            tweetCount: { ...prev.tweetCount, max: e.target.value },
                          }))
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button size="sm" onClick={() => setIsFilterOpen(false)}>
                    Apply Filters
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {threads.length >= 0 ? (
        <>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all-threads"
                checked={selectedThreads.length > 0 && selectedThreads.length === filteredThreads.length}
                onCheckedChange={selectAllThreads}
                className="data-[state=checked]:bg-blue-600"
              />
              <label htmlFor="select-all-threads" className="text-sm cursor-pointer">
                {selectedThreads.length === 0
                  ? "Select all"
                  : `Selected ${selectedThreads.length}/${filteredThreads.length}`}
              </label>

              {selectedThreads.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="ml-2" disabled={isDeleting}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete {selectedThreads.length}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Selected Threads</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {selectedThreads.length} selected threads? This action cannot be
                        undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={handleBulkDelete}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>

            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search threads..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {filteredThreads.length === 0 ? (
            <div className="flex items-center justify-center p-6 border border-dashed border-border rounded-md">
              <div className="text-center">
                <Filter className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No threads match your filters</p>
                <Button variant="link" size="sm" onClick={resetFilters} className="mt-2">
                  Reset Filters
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredThreads.map((thread) => (
                <Card key={thread.id} className="group">
                  <CardHeader className="pb-2 flex flex-row items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedThreads.includes(thread.id)}
                          onCheckedChange={() => toggleThreadSelection(thread.id)}
                          className="mt-1 data-[state=checked]:bg-blue-600"
                        />
                        <div>
                          <CardTitle>{thread.title}</CardTitle>
                          <CardDescription>
                            {format(new Date(thread.createdAt), "MMM d, yyyy")} • {thread.tweetCount} tweets
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Thread</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this thread? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={async () => {
                              try {
                                const response = await fetch("/api/thread/delete", {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    userAccessToken: session?.user?.accessToken,
                                    userAccessSecret: session?.user?.accessSecret,
                                    threadIds: [thread.id],
                                  }),
                                })

                                const result = await response.json()

                                if (result.success) {
                                  setThreads(threads.filter((t) => t.id !== thread.id))
                                  toast({
                                    title: "Thread deleted",
                                    description: "The thread has been successfully deleted.",
                                  })
                                } else {
                                  throw new Error(result.error || "Failed to delete thread")
                                }
                              } catch (error) {
                                console.error("Error deleting thread:", error)
                                toast({
                                  title: "Error",
                                  description: "Failed to delete thread. Please try again.",
                                  variant: "destructive",
                                })
                              }
                            }}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {thread.content.length > 150 ? `${thread.content.substring(0, 150)}...` : thread.content}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <Heart className="w-3 h-3 mr-1 text-red-500" /> {thread.metrics?.likes || 0}
                      </span>
                      <span className="flex items-center">
                        <RefreshCw className="w-3 h-3 mr-1 text-green-500" /> {thread.metrics?.retweets || 0}
                      </span>
                      <span className="flex items-center">
                        <MessageCircle className="w-3 h-3 mr-1 text-blue-500" /> {thread.metrics?.replies || 0}
                      </span>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
            <MessageCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium text-muted-foreground mb-2">No threads yet</h3>
          <p className="text-muted-foreground">Your threads will appear here once you start posting</p>
        </div>
      )}
    </div>
  )
}

