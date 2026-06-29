import { redirect } from "next/navigation";

export default function AdminIngestionRedirectPage() {
  redirect("/admin/documents");
}
