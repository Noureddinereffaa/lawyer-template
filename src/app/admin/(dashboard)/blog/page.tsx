import { redirect } from "next/navigation";

// This route was replaced by /admin/articles
// Redirect permanently to keep any saved bookmarks working
export default function OldBlogAdminPage() {
  redirect("/admin/articles");
}
