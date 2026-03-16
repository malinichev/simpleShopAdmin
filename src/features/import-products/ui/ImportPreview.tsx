interface ImportPreviewProps {
  headers: string[];
  rows: string[][];
  totalRows: number;
}

export function ImportPreview({ headers, rows, totalRows }: ImportPreviewProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-500">
        Превью первых {rows.length} из {totalRows} строк
      </p>
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
              {headers.map((h, i) => (
                <th key={i} className="whitespace-nowrap px-3 py-2 text-left font-medium text-gray-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className="border-b border-gray-100 dark:border-gray-800">
                {headers.map((_, ci) => (
                  <td
                    key={ci}
                    className="max-w-[200px] truncate whitespace-nowrap px-3 py-1.5 text-gray-700 dark:text-gray-300"
                    title={row[ci] || ''}
                  >
                    {row[ci] || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
