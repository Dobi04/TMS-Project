type PaginationProps = {
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({ page, totalPages, totalCount, pageSize: _pageSize, onPageChange }: PaginationProps) {
  if (totalCount <= 0) {
    return null;
  }

  return (
    <div className="mt-5 flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
      <p>Showing page {page} of {totalPages} · {totalCount.toLocaleString()} total entries</p>
      <div className="flex gap-2">
        <button type="button" onClick={() => onPageChange(Math.max(page - 1, 1))} disabled={page <= 1} className="border border-[#183b70] px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#183b70] transition hover:bg-[#183b70] hover:text-white disabled:cursor-not-allowed disabled:opacity-40">
          Previous
        </button>
        <button type="button" onClick={() => onPageChange(Math.min(page + 1, totalPages))} disabled={page >= totalPages} className="border border-[#183b70] px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#183b70] transition hover:bg-[#183b70] hover:text-white disabled:cursor-not-allowed disabled:opacity-40">
          Next
        </button>
      </div>
    </div>
  );
}
