"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { authClient } from "@/lib/auth/auth-client"
import { UserWithRole } from "better-auth/plugins/admin"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserRow } from "./user-row"
import { Search, X, Loader2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// ─── Types ────────────────────────────────────────────────────────────────────

type RoleFilter = "all" | "admin" | "user"
type StatusFilter = "all" | "active" | "banned" | "pending"

// ─── Component ────────────────────────────────────────────────────────────────

export function UserListClient({ selfId }: { selfId: string }) {
  const [users, setUsers] = useState<UserWithRole[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")

  // Debounce search input to avoid firing a request on every keystroke
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ─── Fetch ──────────────────────────────────────────────────────────────────

  const fetchUsers = useCallback(
    async (searchValue: string, role: RoleFilter, status: StatusFilter) => {
      setLoading(true)

      // Build the query object for Better Auth listUsers
      const query: Parameters<typeof authClient.admin.listUsers>[0]["query"] = {
        limit: 200,
        sortBy: "createdAt",
        sortDirection: "desc",
      }

      // Server-side search by email or name
      if (searchValue.trim()) {
        query.searchValue = searchValue.trim()
        // Search across both name and email by defaulting to email field,
        // then let the server handle partial matches
        query.searchField = "email"
        query.searchOperator = "contains"
      }

      // Role filter — Better Auth supports filterField / filterValue
      if (role !== "all") {
        query.filterField = "role"
        query.filterValue = role
        query.filterOperator = "eq"
      }

      // Banned status filter — mutually exclusive with invitePending
      if (status === "banned") {
        query.filterField = "banned"
        query.filterValue = true
        query.filterOperator = "eq"
      } else if (status === "active") {
        query.filterField = "banned"
        query.filterValue = false
        query.filterOperator = "eq"
      } else if (status === "pending") {
        // Filter for users awaiting their invite — invitePending = true
        query.filterField = "invitePending"
        query.filterValue = true
        query.filterOperator = "eq"
      }

      const res = await authClient.admin.listUsers({ query })

      if (res.data) {
        let fetchedUsers = res.data.users

        // For the pending filter, also exclude anyone who has since verified
        // their email (they completed the invite flow — emailVerified = true).
        // We do this client-side because Better Auth only supports one filterField.
        if (status === "pending") {
          fetchedUsers = fetchedUsers.filter(u => !u.emailVerified)
        }

        setUsers(fetchedUsers)
        setTotal(res.data.total)
      }

      setLoading(false)
    },
    []
  )

  // ─── Debounced search trigger ────────────────────────────────────────────────

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchUsers(search, roleFilter, statusFilter)
    }, 350)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, roleFilter, statusFilter])

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  function clearSearch() {
    setSearch("")
  }

  const hasActiveFilters =
    search !== "" || roleFilter !== "all" || statusFilter !== "all"

  function clearAllFilters() {
    setSearch("")
    setRoleFilter("all")
    setStatusFilter("all")
  }

  // True when the opposing filter group should be locked out
  const roleIsActive = roleFilter !== "all"
  const statusIsActive = statusFilter !== "all"

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* ── Toolbar ── */}
      <div className="flex flex-col xl:flex-row gap-3">
        {/* Search box */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            id="admin-user-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email..."
            className="pl-9 pr-9"
          />
          {search && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          {/* Role filter pills */}
          <div
            className={`grid grid-cols-3 sm:flex items-center gap-1.5 shrink-0 transition-opacity duration-200 ${
              statusIsActive ? "opacity-40 cursor-not-allowed" : ""
            }`}
            title={statusIsActive ? "Clear the status filter first to filter by role" : undefined}
          >
            {(["all", "admin", "user"] as RoleFilter[]).map((r) => (
              <Button
                key={r}
                size="sm"
                variant={roleFilter === r ? "default" : "outline"}
                onClick={() => !statusIsActive && setRoleFilter(r)}
                disabled={statusIsActive}
                className="capitalize h-9 w-full sm:w-auto"
              >
                {r === "all" ? "All Roles" : r}
              </Button>
            ))}
          </div>

          {/* Conflict hint — only visible when one filter group is active */}
          {(roleIsActive || statusIsActive) && (
            <div className="flex items-center shrink-0 hidden sm:flex">
              <span className="text-[10px] text-muted-foreground/70 bg-muted px-2 py-1 rounded-md whitespace-nowrap">
                One filter at a time
              </span>
            </div>
          )}

          {/* Status filter pills */}
          <div
            className={`grid grid-cols-2 md:grid-cols-4 sm:flex items-center gap-1.5 shrink-0 transition-opacity duration-200 ${
              roleIsActive ? "opacity-40 cursor-not-allowed" : ""
            }`}
            title={roleIsActive ? "Clear the role filter first to filter by status" : undefined}
          >
            {(["all", "active", "banned", "pending"] as StatusFilter[]).map((s) => (
              <Button
                key={s}
                size="sm"
                variant={statusFilter === s ? "default" : "outline"}
                onClick={() => !roleIsActive && setStatusFilter(s)}
                disabled={roleIsActive}
                className={`capitalize h-9 w-full sm:w-auto ${
                  s === "pending" ? "text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700 data-[variant=default]:bg-amber-600 data-[variant=default]:text-white" : ""
                }`}
              >
                {s === "all" ? "All Status" : s === "pending" ? "Pending" : s}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Active filter summary bar ── */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground font-medium">
            Active filters:
          </span>
          {search && (
            <Badge variant="secondary" className="gap-1 text-xs">
              Search: &ldquo;{search}&rdquo;
              <button onClick={clearSearch} aria-label="Remove search filter">
                <X className="size-3" />
              </button>
            </Badge>
          )}
          {roleFilter !== "all" && (
            <Badge variant="secondary" className="gap-1 text-xs capitalize">
              Role: {roleFilter}
              <button onClick={() => setRoleFilter("all")} aria-label="Remove role filter">
                <X className="size-3" />
              </button>
            </Badge>
          )}
          {statusFilter !== "all" && (
            <Badge variant="secondary" className="gap-1 text-xs capitalize">
              Status: {statusFilter}
              <button onClick={() => setStatusFilter("all")} aria-label="Remove status filter">
                <X className="size-3" />
              </button>
            </Badge>
          )}
          <button
            onClick={clearAllFilters}
            className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors ml-1"
          >
            Clear all
          </button>
          <span className="ml-auto text-xs text-muted-foreground">
            {loading ? "Searching..." : `${total} result${total !== 1 ? "s" : ""}`}
          </span>
        </div>
      )}

      {/* ── User Data Table ── */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50 uppercase text-xs tracking-wider">
              <TableHead className="w-[40%] min-w-[220px] pl-4 sm:pl-6">User</TableHead>
              <TableHead className="w-[25%] min-w-[150px]">Role & Status</TableHead>
              <TableHead className="w-[20%] min-w-[140px]">Joined Date</TableHead>
              <TableHead className="w-[15%] min-w-[100px] text-right pr-4 sm:pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-48 text-center">
                  <div className="flex items-center justify-center">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    {hasActiveFilters ? (
                      <>
                        <p className="text-muted-foreground font-medium">No users match your filters.</p>
                        <button
                          onClick={clearAllFilters}
                          className="text-sm text-primary hover:underline"
                        >
                          Clear filters
                        </button>
                      </>
                    ) : (
                      <p className="text-muted-foreground">No users found.</p>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <UserRow key={user.id} user={user} selfId={selfId} />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Result count (when no active filters) ── */}
      {!hasActiveFilters && !loading && users.length > 0 && (
        <p className="text-xs text-center text-muted-foreground">
          Showing {users.length} of {total} users
        </p>
      )}
    </div>
  )
}
