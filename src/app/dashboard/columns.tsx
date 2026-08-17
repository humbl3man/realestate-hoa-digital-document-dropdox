"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, ExternalLink, MoreVertical, Eye, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"
import React, { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { deletePortal } from "./actions"

export type PortalData = {
  id: string
  name: string
  slug: string
  priceInCents: number
  fileCount: number
  createdAt: Date
  updatedAt: Date | null
}

const PortalActions = ({ portal }: { portal: PortalData }) => {
  const [showDelete, setShowDelete] = useState(false)
  const [isPending, startTransition] = React.useTransition()

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deletePortal(portal.id)
        toast.success("Portal deleted successfully!")
        setShowDelete(false)
      } catch (err: any) {
        toast.error(err?.message || "Failed to delete portal.")
      }
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
        } />
        <DropdownMenuContent align="end">
          <DropdownMenuItem render={
            <Link href={`/dashboard/portals/${portal.id}`} className="cursor-pointer">
              <Eye className="mr-2 h-4 w-4" />
              View
            </Link>
          } />
          <DropdownMenuItem
            onClick={() => setShowDelete(true)}
          >
            <Trash2 className="mr-2 h-4 w-4 text-destructive hover:text-destructive" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDelete} onOpenChange={isPending ? undefined : setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex flex-col gap-4">
                <DialogTitle>Delete Portal</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete <strong className="font-semibold">{portal.name}</strong>? This action cannot be undone.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowDelete(false)}
              disabled={isPending}
              size="sm"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="w-full sm:w-auto"
              onClick={handleDelete}
              size="sm"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export const columns: ColumnDef<PortalData>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Portal Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const name = row.getValue("name") as string
      const displayName = name.length > 20 ? name.slice(0, 20) + "..." : name
      return (
        <Link
          href={`/dashboard/portals/${row.original.id}`}
          className="hover:underline underline-offset-2 inline-block w-fit font-semibold text-foreground"
          style={{ viewTransitionName: `portal-name-${row.original.id}` } as React.CSSProperties}
          title={name.length > 20 ? name : undefined}
        >
          {displayName}
        </Link>
      )
    },
  },
  {
    id: "publicUrl",
    header: "Public URL",
    cell: ({ row }) => {
      const publicUrl = `/p/${row.original.slug}`
      return (
        <Link
          href={publicUrl}
          target="_blank"
          className="text-muted-foreground hover:text-accent flex items-center gap-1.5 transition-colors"
        >
          {publicUrl}
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      )
    }
  },
  {
    accessorKey: "priceInCents",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("priceInCents")) / 100
      return <span className="text-muted-foreground">${amount.toFixed(2)}</span>
    }
  },
  {
    accessorKey: "fileCount",
    header: "Files",
    cell: ({ row }) => {
      const count: number = row.getValue("fileCount")
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
            count === 0
              ? "bg-muted text-muted-foreground ring-border"
              : "bg-success/10 text-success ring-success/20"
          )}
        >
          {count} {count === 1 ? "file" : "files"}
        </span>
      )
    }
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Created At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date: Date = row.getValue("createdAt")
      return <span className="text-muted-foreground">{date.toLocaleDateString()}</span>
    }
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Modified At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date: Date | null = row.getValue("updatedAt")
      if (!date) return <span className="text-muted-foreground">-</span>
      if (date.getTime() === 0) return <span className="text-muted-foreground">-</span>
      return <span className="text-muted-foreground">{date.toLocaleDateString()}</span>
    }
  },
  {
    id: "actions",
    header: () => <div className="text-center w-12"></div>,
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-center w-12 pr-12">
          <PortalActions portal={row.original} />
        </div>
      )
    },
  },
]
