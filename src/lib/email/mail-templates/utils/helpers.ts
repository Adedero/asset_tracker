function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const styles = `font-family="Verdana"`;
const paragraph = (content: string) => `<mj-text ${styles}>${content}</mj-text>`;

export function render(data?: any): string {
  if (!data) return "";

  if (
    typeof data === "string" ||
    typeof data === "number" ||
    typeof data === "boolean" ||
    data instanceof Date
  ) {
    return paragraph(String(data));
  }

  if (Array.isArray(data)) {
    return `<ul>${data.map((item) => `<li>${render(item)}</li>`).join("")}</ul>`;
  }

  if (typeof data === "object") {
    return Object.entries(data)
      .map(([key, value]) => {
        if (
          typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean" ||
          value instanceof Date
        ) {
          return paragraph(`${key}: ${String(value)}`);
        } else {
          return paragraph(`${key}: ${render(value)}`);
        }
      })
      .join("");
  }

  return paragraph(String(data));
}
