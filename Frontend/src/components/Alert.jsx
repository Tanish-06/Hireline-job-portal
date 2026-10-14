// Small message box: <Alert type="error">...</Alert> or type="success"
export default function Alert({ type = "error", children }) {
  if (!children) return null;
  const color =
    type === "error"
      ? "border-red-200 bg-red-50 text-red-800"
      : "border-green-200 bg-green-50 text-green-800";
  return <p className={`rounded-md border px-3 py-2 text-sm ${color}`} role="alert">{children}</p>;
}
