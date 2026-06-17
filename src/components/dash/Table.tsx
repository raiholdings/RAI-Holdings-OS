import type { ReactNode } from "react";

export function Table({ head, children }: { head: ReactNode[]; children: ReactNode }) {
  return (
    <div className="-mx-1 overflow-x-auto">
      <table className="w-full border-collapse text-left text-[0.85rem]">
        <thead>
          <tr className="border-b border-border">
            {head.map((h, i) => (
              <th key={i} className="label px-3 py-3 text-text-2">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Row({ children }: { children: ReactNode }) {
  return <tr className="border-b border-border transition-colors last:border-0 hover:bg-bg">{children}</tr>;
}

export function Cell({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={`px-3 py-3 align-middle ${className ?? ""}`}>{children}</td>;
}
