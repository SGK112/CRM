"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"

type Attachment = { fileName: string; fileSize: number; url: string }
type ClientInfo = { name: string; email: string; phone?: string }
type Message = {
  _id: string
  subject: string
  content?: string
  body?: string
  sender?: string
  senderName?: string
  from?: string
  to?: string[]
  type?: string
  createdAt: string
  isRead?: boolean
  isStarred?: boolean
  isArchived?: boolean
  priority?: "urgent" | "high" | "normal" | "low"
  metadata?: {
    attachments?: Attachment[]
    actionUrl?: string
    actionLabel?: string
    clientInfo?: ClientInfo
  }
}

type InboxStats = {
  total: number
  unread: number
  starred: number
  archived: number
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function InboxPage() {
  // Filters/search
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "unread" | "starred" | "archived">("all")

  // Data
  const [messages, setMessages] = useState<Message[]>([])
  const [stats, setStats] = useState<InboxStats>({ total: 0, unread: 0, starred: 0, archived: 0 })
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = useMemo(() => messages.find((m) => m._id === selectedId) || null, [messages, selectedId])

  // Compose
  const [composeOpen, setComposeOpen] = useState(false)
  const [composeTo, setComposeTo] = useState("")
  const [composeSubject, setComposeSubject] = useState("")
  const [composeBody, setComposeBody] = useState("")
  const [draftCount, setDraftCount] = useState(0)

  // Auth
  const [noAuth, setNoAuth] = useState(false)
  const tokenRef = useRef<string | null>(null)
  useEffect(() => {
    try {
      const t = localStorage.getItem("token") || localStorage.getItem("accessToken")
      tokenRef.current = t
      setNoAuth(!t)
    } catch {
      setNoAuth(true)
    }
  }, [])

  const getAuthHeaders = (): HeadersInit =>
    tokenRef.current ? { Authorization: `Bearer ${tokenRef.current}` } : {}

  const mergeHeaders = (...parts: HeadersInit[]): Headers => {
    const h = new Headers()
    for (const p of parts) new Headers(p).forEach((v, k) => h.set(k, v))
    return h
  }

  // Draft restore/persist
  useEffect(() => {
    try {
      const draft = localStorage.getItem("inbox_draft_v1")
      if (draft) {
        const d = JSON.parse(draft)
        setComposeTo(d.to || "")
        setComposeSubject(d.subject || "")
        setComposeBody(d.body || "")
        setDraftCount(1)
      }
    } catch (e) {
      // ignore draft restore errors
    }
  }, [])
  useEffect(() => {
    try {
      const payload = JSON.stringify({ to: composeTo, subject: composeSubject, body: composeBody })
      localStorage.setItem("inbox_draft_v1", payload)
      setDraftCount(composeTo || composeSubject || composeBody ? 1 : 0)
    } catch (e) {
      // ignore draft save errors
    }
  }, [composeTo, composeSubject, composeBody])

  // Fetchers
  async function fetchStats() {
    try {
  const res = await fetch("/api/inbox/stats", { headers: getAuthHeaders() })
      if (!res.ok) return
      const data = await res.json()
      setStats({ total: data.total ?? 0, unread: data.unread ?? 0, starred: data.starred ?? 0, archived: data.archived ?? 0 })
    } catch (e) {
      // ignore stats error
    }
  }

  async function fetchList() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("q", search)
      if (filter !== "all") params.set("filter", filter)
  const res = await fetch(`/api/inbox?${params.toString()}`, { headers: getAuthHeaders() })
      if (!res.ok) {
        setMessages([])
        return
      }
      const data = await res.json()
      setMessages(data || [])
      if (data?.length && !selectedId) setSelectedId(data[0]._id)
  } catch (e) {
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    async function initStats() {
      try {
        const r = await fetch("/api/inbox/stats", { headers: getAuthHeaders() })
        if (!r.ok) return
        const data = await r.json()
        setStats({ total: data.total ?? 0, unread: data.unread ?? 0, starred: data.starred ?? 0, archived: data.archived ?? 0 })
      } catch (e) {
        // ignore
      }
    }
    initStats()
  }, [])
  useEffect(() => {
    const t = setTimeout(fetchList, 200)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filter])

  // Actions
  async function doAction(path: string, init?: RequestInit) {
    setActionLoading(path)
    try {
      const headers = mergeHeaders({ "Content-Type": "application/json" }, getAuthHeaders(), init?.headers ?? {})
      const res = await fetch(path, {
        ...init,
        headers,
      })
      if (!res.ok) return
      await Promise.all([fetchList(), fetchStats()])
    } finally {
      setActionLoading(null)
    }
  }

  const markRead = (id: string) => doAction(`/api/inbox/${id}/read`, { method: "PATCH" })
  const toggleStar = (id: string) => doAction(`/api/inbox/${id}/star`, { method: "PATCH" })
  const toggleArchive = (id: string) => doAction(`/api/inbox/${id}/archive`, { method: "PATCH" })
  const deleteMessage = (id: string) => doAction(`/api/inbox/${id}`, { method: "DELETE" })
  const markAllRead = () => doAction(`/api/inbox/mark-all-read`, { method: "POST" })
  const markUnread = (id: string) => doAction(`/api/inbox/${id}`, { method: "PATCH", body: JSON.stringify({ isRead: false }) })

  async function sendMessage() {
    if (!composeTo || !composeSubject || !composeBody) return
    await doAction(`/api/inbox`, {
      method: "POST",
      body: JSON.stringify({ to: composeTo.split(",").map((s) => s.trim()).filter(Boolean), subject: composeSubject, body: composeBody }),
    })
    setComposeOpen(false)
    setComposeTo("")
    setComposeSubject("")
    setComposeBody("")
    try {
      localStorage.removeItem("inbox_draft_v1")
      setDraftCount(0)
    } catch (e) {
      // ignore remove error
    }
  }

  return (
    <div className="p-4 md:p-6">
      {noAuth && (
        <div className="mb-3 rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-900">
          You are not authenticated. Some actions are disabled. Log in to enable sending and updates.
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Inbox</h1>
          <p className="text-sm text-gray-500">Messages and CRM notifications</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="w-64 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button onClick={() => setComposeOpen(true)} className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Compose
          </button>
          <button onClick={markAllRead} className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200">
            Mark all read
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Left: Filters and stats */}
        <aside className="col-span-12 md:col-span-3 space-y-2">
          <button
            onClick={() => setFilter("all")}
            className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm ${filter === "all" ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50"}`}
          >
            <span>All mail</span>
            <span className="text-xs text-gray-500">{stats.total}</span>
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm ${filter === "unread" ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50"}`}
          >
            <span>Unread</span>
            <span className="text-xs text-gray-500">{stats.unread}</span>
          </button>
          <button
            onClick={() => setFilter("starred")}
            className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm ${filter === "starred" ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50"}`}
          >
            <span>Starred</span>
            <span className="text-xs text-gray-500">{stats.starred}</span>
          </button>
          <button
            onClick={() => setFilter("archived")}
            className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm ${filter === "archived" ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50"}`}
          >
            <span>Archived</span>
            <span className="text-xs text-gray-500">{stats.archived}</span>
          </button>
        </aside>

        {/* Middle: List */}
        <section className="col-span-12 space-y-2 md:col-span-4">
          {loading ? (
            <div className="text-sm text-gray-500">Loading…</div>
          ) : messages.length === 0 ? (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-gray-500">No messages</div>
          ) : (
            <ul className="divide-y rounded-md border">
              {messages.map((m) => (
                <li
                  key={m._id}
                  onClick={() => setSelectedId(m._id)}
                  className={`cursor-pointer p-3 text-sm hover:bg-gray-50 ${selectedId === m._id ? "bg-blue-50" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium truncate max-w-[65%]">{m.subject || "(no subject)"}</div>
                    <div className="text-xs text-gray-500">{formatDate(m.createdAt)}</div>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-gray-600">
                    <div className="truncate max-w-[70%]">From: {m.senderName || m.sender || m.from || "Unknown"}</div>
                    <div className="flex items-center gap-2">
                      {m.isStarred && <span className="text-yellow-600">★</span>}
                      {!m.isRead && <span className="inline-block h-2 w-2 rounded-full bg-blue-600" />}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Right: Detail */}
        <section className="col-span-12 md:col-span-5">
          {!selected ? (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-gray-500">Select a message</div>
          ) : (
            <div className="rounded-md border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{selected.subject || "(no subject)"}</h2>
                  <p className="text-xs text-gray-500">From {selected.senderName || selected.sender || selected.from || "Unknown"} • {formatDate(selected.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => markRead(selected._id)} disabled={!!actionLoading} className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50">Mark read</button>
                  <button onClick={() => markUnread(selected._id)} disabled={!!actionLoading} className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50">Mark unread</button>
                  <button onClick={() => toggleStar(selected._id)} disabled={!!actionLoading} className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50">Star</button>
                  <button onClick={() => toggleArchive(selected._id)} disabled={!!actionLoading} className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50">Archive</button>
                  <button onClick={() => deleteMessage(selected._id)} disabled={!!actionLoading} className="rounded-md border px-2 py-1 text-xs text-red-600 hover:bg-red-50">Delete</button>
                </div>
              </div>
              <div className="prose mt-4 max-w-none whitespace-pre-wrap text-sm">
                {selected.content || selected.body}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Compose modal */}
      {composeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white p-4 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">New message</h3>
              <button onClick={() => setComposeOpen(false)} className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50">Close</button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-12 items-center gap-2">
                <label className="col-span-2 text-right text-sm text-gray-600">To</label>
                <input
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  placeholder="email1@example.com, email2@example.com"
                  className="col-span-10 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-12 items-center gap-2">
                <label className="col-span-2 text-right text-sm text-gray-600">Subject</label>
                <input
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="Subject"
                  className="col-span-10 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-12 items-start gap-2">
                <label className="col-span-2 text-right text-sm text-gray-600">Message</label>
                <textarea
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Write your message..."
                  rows={10}
                  className="col-span-10 resize-y rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {draftCount > 0 && (
                <div className="text-xs text-gray-500">Draft auto-saved</div>
              )}
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button onClick={() => setComposeOpen(false)} className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={sendMessage} disabled={!composeTo || !composeSubject || !composeBody || !!actionLoading} className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white enabled:hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
