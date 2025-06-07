import env from "#src/utils/env";
export function render(data) {
    const styles = `font-family="Verdana"`;
    const paragraph = (content) => `<p${styles}>${content}</p>`;
    if (!data)
        return "";
    if (typeof data === "string" ||
        typeof data === "number" ||
        typeof data === "boolean" ||
        data instanceof Date) {
        return paragraph(String(data));
    }
    if (Array.isArray(data)) {
        return `<ul>${data.map((item) => `<li>${render(item)}</li>`).join("")}</ul>`;
    }
    if (typeof data === "object") {
        return Object.entries(data)
            .map(([key, value]) => {
            if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
                return paragraph(`${key}: ${String(value)}`);
            }
            else {
                return paragraph(`${key}: ${render(value)}`);
            }
        })
            .join("");
    }
    return paragraph(String(data));
}
export function formatMailHTMLContent(html, subject) {
    const appName = env.get("APP_NAME", "App Assets Tracker");
    return `<html lang="en">
  <head>
    <title>${subject}</title>
    <style>
      * {
        padding: 0;
        margin: 0;
        box-sizing: border-box;
      }
    </style>
  </head>

  <body style="width: 100%; max-width: 100%; padding: 0.8rem">
    <main style="border: 1px solid #aaa; border-radius: 5px; padding: 0.8rem">
      <header>
        <div style="background-color: #eee; width: 32px; height: 32px; border-radius: 5px; overflow: hidden">
          <img src="${env.get("APP_URL")}/logo.png" style="width: 100%; height: 100%; object-fit: cover" alt="logo" />
        </div>

        ${subject
        ? `<div style="margin-top: 1rem; color: #3974d0;">
          <h1 style="font-weight: 600; font-size: 22px">${subject}</h1>
        </div>`
        : ""}
      </header>

      <div style="margin-top: 1.5rem">
        ${html}
      </div>

      <footer style="padding: 0.8rem 1rem; margin-top: 2rem; background-color: #3974D0; border-radius: 5px; color: white; text-align: center; font-size: 12px">
        ${appName} &copy; ${new Date().getFullYear()} All rights reserved.
      </footer>
    </main>
  </body>
</html>`;
}
