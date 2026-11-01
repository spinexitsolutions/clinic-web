import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="grid min-h-[50vh] place-items-center text-center">
      <div>
        <p className="eyebrow">404</p>
        <h1 className="mt-2 text-3xl font-medium tracking-[-0.04em]">Nothing here.</h1>
        <Link href="/admin" className="btn btn-primary mt-6">Back to dashboard</Link>
      </div>
    </div>
  );
}
