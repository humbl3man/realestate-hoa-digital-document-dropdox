"use client";

import { useState, useTransition } from "react";
import { useTransitionRouter as useRouter } from "next-view-transitions";
import {
  deleteDocumentAction,
  updatePortal,
  deletePortal,
} from "../../actions";
import { appConfig } from "@/config";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Attachment,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
} from "@/components/ui/attachment";
import {
  Loader2,
  Upload,
  FileText,
  Trash2,
  ExternalLink,
  AlertTriangle,
  ChevronRight,
  Save,
} from "lucide-react";
import { Link } from "next-view-transitions";
import { FormError } from "@/components/ui/form-error";
import { toast } from "sonner";

interface Document {
  id: string;
  portalId: string;
  storagePath: string;
  fileName: string;
  fileSize: number;
  createdAt: Date;
}

interface Portal {
  id: string;
  userId: string;
  name: string;
  slug: string;
  description: string | null;
  priceInCents: number;
  createdAt: Date;
}

interface PortalManagerProps {
  portal: Portal;
  documents: Document[];
}

export function PortalManager({ portal, documents }: PortalManagerProps) {
  const [name, setName] = useState(portal.name);
  const [slug, setSlug] = useState(portal.slug);
  const [description, setDescription] = useState(portal.description || "");
  const [price, setPrice] = useState((portal.priceInCents / 100).toFixed(2));

  const [savingSettings, setSavingSettings] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingPortal, setDeletingPortal] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [settingsError, setSettingsError] = useState("");
  const [uploadError, setUploadError] = useState("");

  const [isDragOver, setIsDragOver] = useState(false);
  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsError("");

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 5.00) {
      setSettingsError("Please enter a valid price of at least $5.00.");
      setSavingSettings(false);
      return;
    }

    if (description.length > 100) {
      setSettingsError("Description must be 100 characters or less.");
      setSavingSettings(false);
      return;
    }

    try {
      const res = await updatePortal(portal.id, {
        name,
        slug: slug.toLowerCase().replace(/[^a-z0-9-_]/g, ""),
        description: description || undefined,
        priceInCents: Math.round(parsedPrice * 100),
      });

      if (res?.error) {
        setSettingsError(res.error);
        toast.error(res.error);
        return;
      }

      toast.success("Settings saved successfully!");
      router.refresh();
    } catch (err: any) {
      setSettingsError(err?.message || "Failed to update portal settings.");
      toast.error("Failed to update portal settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  const uploadFiles = (files: File[]) => {
    const validFiles = files.filter(
      (f) => f.type === "application/pdf" || f.name.endsWith(".pdf"),
    );

    if (validFiles.length === 0) {
      setUploadError("Only PDF files are allowed.");
      return;
    }

    setUploading(true);
    setUploadError("");

    startTransition(async () => {
      try {
        const formData = new FormData();
        for (const file of validFiles) {
          formData.append("file", file);
        }
        formData.append("portalId", portal.id);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to upload files.");
        }

        router.refresh();
      } catch (err: any) {
        setUploadError(err?.message || "File upload failed.");
      } finally {
        setUploading(false);
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFiles(Array.from(files));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      uploadFiles(Array.from(files));
    }
  };

  const handleDeleteDoc = (docId: string) => {
    setDeletingId(docId);
    startTransition(async () => {
      try {
        await deleteDocumentAction(docId, portal.id);
        router.refresh();
      } catch (err: any) {
        alert(err?.message || "Failed to delete document.");
      } finally {
        setDeletingId(null);
      }
    });
  };

  const handleDeletePortal = () => {
    setDeletingPortal(true);
    startTransition(async () => {
      try {
        await deletePortal(portal.id);
        toast.success("Portal deleted successfully!");
        router.push("/dashboard");
      } catch (err: any) {
        toast.error(err?.message || "Failed to delete portal.");
        setDeletingPortal(false);
      }
    });
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const publicPortalUrl = `/p/${portal.slug}`;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header row: breadcrumb + view public link */}
      <div className="flex items-center justify-between">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link
            href="/dashboard"
            className="hover:text-foreground transition-colors"
          >
            Portals
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-medium truncate max-w-[200px]">
            {portal.name}
          </span>
        </nav>
        <Link
          href={publicPortalUrl}
          target="_blank"
          className={buttonVariants({
            variant: "ghost",
          })}
        >
          View Public Page
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>

      <div>
        <h1 
          className="text-3xl font-extrabold tracking-tight w-fit inline-block"
          style={{ viewTransitionName: `portal-name-${portal.id}` } as React.CSSProperties}
        >
          {portal.name}
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage portal settings and upload documents.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left/Middle: Document list & Uploader */}
        <div className="lg:col-span-2 space-y-8">
          {/* Disclaimer Banner */}
          <Alert className="bg-accent/5 border-accent/50 text-foreground p-4 gap-x-3">
            <AlertTriangle className="size-5" />
            <AlertTitle className="font-semibold text-sm mb-1">Important Privacy Notice</AlertTitle>
            <AlertDescription className="text-sm leading-normal">
              Please ensure that you do not upload any documents containing
              sensitive personal information, such as Social Security Numbers
              (SSN), driver&apos;s license numbers, or full bank account
              details.
            </AlertDescription>
          </Alert>

          {/* Uploader Card */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground text-lg">
                Upload PDF Files
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Drag and drop your PDF files here, or click to browse.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <label
                htmlFor="pdf-upload"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 ${
                  isDragOver
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 bg-muted/30"
                }`}
              >
                <input
                  id="pdf-upload"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  onClick={(e) => {
                    e.currentTarget.value = "";
                  }}
                  accept="application/pdf"
                  className="sr-only"
                  disabled={uploading}
                />
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center border border-border">
                    {uploading ? (
                      <Loader2 className="w-5 h-5 text-foreground animate-spin" />
                    ) : (
                      <Upload className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  {uploading ? (
                    <p className="text-sm font-medium text-foreground">
                      Uploading PDF documents...
                    </p>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-foreground">
                        Drag & drop file(s) here, or{" "}
                        <span className="text-accent underline">browse</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Only PDF files are supported
                      </p>
                    </>
                  )}
                </div>
              </label>
              {uploadError && (
                <FormError className="mt-4">{uploadError}</FormError>
              )}
            </CardContent>
          </Card>

          {/* Documents Table */}
          <Card className="bg-card border-border pb-0">
            <CardHeader>
              <CardTitle className="text-card-foreground text-lg">
                Documents in Bundle ({documents.length})
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                These files will be zipped and emailed to buyers upon successful
                purchase.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 border-t border-border">
              {documents.length === 0 ? (
                <div className="text-center py-14 px-6 flex flex-col items-center gap-3 relative">
                  {isPending && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-b-xl">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  )}
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-border bg-muted/40">
                    <FileText className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-base text-foreground">
                    No documents yet
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                    Upload your first PDF document using the uploader above.
                    Buyers will receive all files as a zip archive.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-secondary/2 relative">
                  {isPending && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-b-xl">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  )}
                  <AttachmentGroup className="flex-col gap-3 w-full overflow-visible px-0">
                    {documents.map((doc) => (
                      <Attachment key={doc.id} size="default" orientation="horizontal" className="w-full">
                        <AttachmentMedia variant="icon">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                        </AttachmentMedia>
                        <AttachmentContent>
                          <AttachmentTitle>{doc.fileName}</AttachmentTitle>
                          <AttachmentDescription>
                            {formatBytes(doc.fileSize)} • {new Date(doc.createdAt).toLocaleDateString()}
                          </AttachmentDescription>
                        </AttachmentContent>
                        <AttachmentActions>
                          <AttachmentAction
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            disabled={deletingId === doc.id}
                            onClick={() => handleDeleteDoc(doc.id)}
                            aria-label={`Delete ${doc.fileName}`}
                          >
                            {deletingId === doc.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </AttachmentAction>
                        </AttachmentActions>
                      </Attachment>
                    ))}
                  </AttachmentGroup>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Settings Form */}
        <div className="space-y-6 sticky top-24 self-start">
          <Card className="bg-secondary/2 border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground text-lg">
                Portal Settings
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Update storefront pricing and URL slug.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="name"
                    className="text-xs font-medium text-foreground"
                  >
                    Portal Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="focus-visible:ring-primary focus-visible:border-primary"
                    required
                    disabled={savingSettings}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="slug"
                    className="text-xs font-medium text-foreground"
                  >
                    Public Slug
                  </Label>
                  <div className="flex">
                    <span className="inline-flex h-10 items-center justify-center px-3 rounded-l-lg border border-r-0 border-secondary bg-muted text-muted-foreground text-sm shrink-0">
                      /p/
                    </span>
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSlug(
                          val
                            .toLowerCase()
                            .replace(/\s+/g, "-")
                            .replace(/[^a-z0-9-_]/g, ""),
                        );
                      }}
                      className="rounded-l-none focus-visible:ring-primary focus-visible:border-primary"
                      required
                      disabled={savingSettings}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-normal">
                    Portal URL preview:{" "}
                    <code className="text-foreground">{`/p/${slug}`}</code>
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="description"
                    className="text-xs font-medium text-foreground"
                  >
                    Description (Optional)
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="e.g. Official document package for secure distribution..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={100}
                    className="resize-none focus-visible:ring-primary focus-visible:border-primary"
                    disabled={savingSettings}
                  />
                  <p className="text-[10px] text-muted-foreground leading-normal mt-1">
                    {description.length}/100 characters.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="price"
                    className="text-xs font-medium text-foreground"
                  >
                    Price (USD)
                  </Label>
                  <div className="flex">
                    <span className="inline-flex h-10 items-center justify-center px-3 rounded-l-lg border border-r-0 border-secondary bg-muted text-muted-foreground text-sm shrink-0">
                      $
                    </span>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="5.00"
                      value={price}
                      placeholder="100.00"
                      onChange={(e) => setPrice(e.target.value)}
                      className="rounded-l-none focus-visible:ring-primary focus-visible:border-primary"
                      required
                      disabled={savingSettings}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-normal mt-1">
                    The platform retains a {appConfig.platformFeePercentage}%
                    fee plus Stripe processing fees (~2.9% + 30¢) on each transaction.
                  </p>
                </div>

                {settingsError && <FormError>{settingsError}</FormError>}

                <Button
                  type="submit"
                  variant="secondary"
                  className="w-full mt-2"
                  disabled={savingSettings}
                >
                  {savingSettings ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
              <Dialog open={deleteDialogOpen} onOpenChange={deletingPortal ? undefined : setDeleteDialogOpen}>
                <DialogTrigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full mt-4 text-destructive hover:bg-destructive/10"
                      disabled={deletingPortal}
                    />
                  }
                >
                  {deletingPortal ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Portal
                    </>
                  )}
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                      </div>
                      <div>
                        <DialogTitle>Delete Portal</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete this portal? This action
                          cannot be undone and all associated documents will be
                          permanently removed.
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)} disabled={deletingPortal}>
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeletePortal}
                      disabled={deletingPortal}
                    >
                      {deletingPortal ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Delete Portal"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
