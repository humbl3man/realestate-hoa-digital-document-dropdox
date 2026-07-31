import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DeletePortalDialog } from "@/app/dashboard/delete-portal-dialog";
import { deletePortal } from "@/app/dashboard/actions";
import { toast } from "sonner";

// Mock the dependencies
vi.mock("@/app/dashboard/actions", () => ({
  deletePortal: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Provide base ResizeObserver mock which is often needed by Dialog/Radix/BaseUI
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverMock;

describe("DeletePortalDialog", () => {
  const mockPortalId = "test-portal-id";
  const mockPortalName = "Test Portal";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the delete button trigger", () => {
    render(<DeletePortalDialog portalId={mockPortalId} portalName={mockPortalName} />);
    const triggerBtn = screen.getByRole("button", { name: `Delete portal "${mockPortalName}"` });
    expect(triggerBtn).toBeInTheDocument();
  });

  it("opens the dialog and calls deletePortal on confirmation", async () => {
    (deletePortal as any).mockResolvedValueOnce({});
    
    render(<DeletePortalDialog portalId={mockPortalId} portalName={mockPortalName} />);
    
    // Open dialog
    const triggerBtn = screen.getByRole("button", { name: `Delete portal "${mockPortalName}"` });
    fireEvent.click(triggerBtn);
    
    // Check dialog content
    expect(screen.getByText("Delete Portal")).toBeInTheDocument();
    expect(
      screen.getByText("Are you sure you want to delete this portal? This action cannot be undone.")
    ).toBeInTheDocument();
    
    // Confirm deletion
    const deleteBtn = screen.getByRole("button", { name: "Delete" });
    fireEvent.click(deleteBtn);
    
    await waitFor(() => {
      expect(deletePortal).toHaveBeenCalledWith(mockPortalId);
    });
    
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Portal deleted successfully!");
    });
  });

  it("shows an error toast when deletion fails", async () => {
    const errorMessage = "Failed to delete for some reason";
    (deletePortal as any).mockRejectedValueOnce(new Error(errorMessage));
    
    render(<DeletePortalDialog portalId={mockPortalId} portalName={mockPortalName} />);
    
    // Open dialog
    const triggerBtn = screen.getByRole("button", { name: `Delete portal "${mockPortalName}"` });
    fireEvent.click(triggerBtn);
    
    // Confirm deletion
    const deleteBtn = screen.getByRole("button", { name: "Delete" });
    fireEvent.click(deleteBtn);
    
    await waitFor(() => {
      expect(deletePortal).toHaveBeenCalledWith(mockPortalId);
    });
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });
  });
});
