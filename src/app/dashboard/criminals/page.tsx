import { getCriminals } from "@/features/criminals/queries";
import { CriminalStatus } from "@prisma/client";
import Link from "next/link";
import { PlusCircle, Search, User } from "lucide-react";

export const metadata = {
  title: "Criminal Database | Forensix",
};

export default async function CriminalsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const search = typeof resolvedParams.search === "string" ? resolvedParams.search : undefined;
  const status = typeof resolvedParams.status === "string" ? (resolvedParams.status as CriminalStatus) : undefined;

  const criminals = await getCriminals({ search, status });

  return (
    <div className="flex flex-col gap-6 w-full p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Criminal Database</h1>
          <p className="text-muted-foreground">Manage and search criminal records.</p>
        </div>
        <Link
          href="/dashboard/criminals/new"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Criminal
        </Link>
      </div>

      <div className="rounded-md border">
        <div className="p-4 flex items-center gap-4">
          <form className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              name="search"
              placeholder="Search name, alias or ID..."
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              defaultValue={search}
            />
          </form>
        </div>
        <div className="w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Alias</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Added Date</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {criminals.map((c) => (
                <tr
                  key={c.id}
                  className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                >
                  <td className="p-4 align-middle">
                    <Link href={`/dashboard/criminals/${c.id}`} className="text-primary hover:underline font-medium">
                      {c.criminalId}
                    </Link>
                  </td>
                  <td className="p-4 align-middle flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {c.firstName} {c.lastName}
                  </td>
                  <td className="p-4 align-middle text-muted-foreground">{c.alias || "N/A"}</td>
                  <td className="p-4 align-middle">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${c.status === "WANTED" ? "bg-destructive text-destructive-foreground" : ""}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4 align-middle">{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {criminals.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-muted-foreground">
                    No criminals found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
