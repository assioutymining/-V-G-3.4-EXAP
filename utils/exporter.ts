
export const exportToCSV = (data: any[], filename: string) => {
  if (!data || !data.length) {
    alert('لا توجد بيانات للتصدير');
    return;
  }
  // Create BOM for Arabic support
  const BOM = "\uFEFF";
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map(obj => Object.values(obj).map(val => `"${val}"`).join(",")).join("\n");
  const csvContent = BOM + headers + "\n" + rows;
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
