"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = button;
function button(href, label, options) {
    const { color = "#fff", backgroundColor = "#285BAA", borderRadius = "4px", fontSize = "16px", padding = "10px 20px", centered = false } = options || {};
    return `<div style="${centered ? "position: relative; width: 100%;" : "display: block"}; margin-top: 1.25rem">
  <a href="${href}" style="
    display: inline-block;
    color: ${color};
    background-color: ${backgroundColor};
    border-radius: ${borderRadius};
    font-size: ${fontSize};
    padding: ${padding};
    text-decoration: none;
    text-align: center;
    cursor: pointer;
    ${centered ? "absolute; left: 50%; transform: translateX(-50%);" : ""}
  ">
    ${label}
  </a>
</div>`;
}
