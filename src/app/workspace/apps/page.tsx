import AppsDirectory from "@/app/apps/page";

export const metadata = { title: "Apps · Workspace" };

// The standalone /apps layout wraps the directory in a padded main; replicate it here.
export default function WorkspaceApps() {
  return (
    <main className="mx-auto max-w-[1180px] px-5 py-8 sm:px-8">
      <AppsDirectory />
    </main>
  );
}
