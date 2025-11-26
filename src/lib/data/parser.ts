// Rich text parser for 5etools format
// Converts {@spell fireball|XPHB} syntax into React components

import React from "react";
import type { Entry, EntryObject } from "@/types/dnd";

// Regex patterns for different tag types
const TAG_PATTERN = /\{@(\w+)\s+([^}]+)\}/g;

interface ParsedTag {
  type: string;
  content: string;
  display?: string;
  source?: string;
}

// Parse a single tag like {@spell fireball|XPHB|custom display text}
function parseTag(match: string): ParsedTag {
  const tagMatch = match.match(/\{@(\w+)\s+([^}]+)\}/);
  if (!tagMatch) return { type: "text", content: match };

  const [, type, content] = tagMatch;
  const parts = content.split("|");
  
  return {
    type,
    content: parts[0],
    source: parts[1],
    display: parts[2] || parts[0],
  };
}

// Convert a string with 5etools tags to plain text (for non-React contexts)
export function parseToPlainText(text: string): string {
  return text.replace(TAG_PATTERN, (match) => {
    const parsed = parseTag(match);
    return parsed.display || parsed.content;
  });
}

// Convert a string with 5etools tags to React elements
export function parseToReact(text: string, keyPrefix: string = "tag"): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  const regex = new RegExp(TAG_PATTERN.source, "g");
  
  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    
    const parsed = parseTag(match[0]);
    parts.push(renderTag(parsed, `${keyPrefix}-${index}`));
    
    lastIndex = match.index + match[0].length;
    index++;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  
  return parts;
}

// Render a parsed tag as a React element
function renderTag(tag: ParsedTag, key: string): React.ReactNode {
  const display = tag.display || tag.content;
  
  switch (tag.type) {
    case "spell":
      return React.createElement("span", {
        key,
        className: "text-purple-600 dark:text-purple-400 cursor-pointer hover:underline font-medium",
        title: `Spell: ${tag.content}`,
        "data-type": "spell",
        "data-key": `${tag.content}|${tag.source || "XPHB"}`,
      }, display);
      
    case "item":
      return React.createElement("span", {
        key,
        className: "text-blue-600 dark:text-blue-400 cursor-pointer hover:underline font-medium",
        title: `Item: ${tag.content}`,
        "data-type": "item",
        "data-key": `${tag.content}|${tag.source || "XPHB"}`,
      }, display);
      
    case "class":
      return React.createElement("span", {
        key,
        className: "text-green-600 dark:text-green-400 cursor-pointer hover:underline font-medium",
        title: `Class: ${tag.content}`,
        "data-type": "class",
        "data-key": `${tag.content}|${tag.source || "XPHB"}`,
      }, display);
      
    case "race":
      return React.createElement("span", {
        key,
        className: "text-orange-600 dark:text-orange-400 cursor-pointer hover:underline font-medium",
        title: `Race: ${tag.content}`,
        "data-type": "race",
        "data-key": `${tag.content}|${tag.source || "XPHB"}`,
      }, display);
      
    case "feat":
      return React.createElement("span", {
        key,
        className: "text-yellow-600 dark:text-yellow-400 cursor-pointer hover:underline font-medium",
        title: `Feat: ${tag.content}`,
        "data-type": "feat",
        "data-key": `${tag.content}|${tag.source || "XPHB"}`,
      }, display);
      
    case "condition":
      return React.createElement("span", {
        key,
        className: "text-red-600 dark:text-red-400 cursor-pointer hover:underline",
        title: `Condition: ${tag.content}`,
        "data-type": "condition",
      }, display);
      
    case "skill":
      return React.createElement("span", {
        key,
        className: "text-cyan-600 dark:text-cyan-400 font-medium",
        "data-type": "skill",
      }, display);
      
    case "dice":
    case "damage":
      return React.createElement("span", {
        key,
        className: "text-red-500 dark:text-red-400 font-mono cursor-pointer hover:bg-red-100 dark:hover:bg-red-900 px-1 rounded",
        title: `Click to roll: ${tag.content}`,
        "data-type": "dice",
        "data-formula": tag.content,
      }, display);
      
    case "hit":
      return React.createElement("span", {
        key,
        className: "text-emerald-600 dark:text-emerald-400 font-mono",
        title: "Attack bonus",
      }, `+${tag.content}`);
      
    case "dc":
      return React.createElement("span", {
        key,
        className: "text-amber-600 dark:text-amber-400 font-medium",
        title: "Difficulty Class",
      }, `DC ${tag.content}`);
      
    case "b":
      return React.createElement("strong", { key }, display);
      
    case "i":
      return React.createElement("em", { key }, display);
      
    case "action":
    case "status":
      return React.createElement("span", {
        key,
        className: "font-semibold",
      }, display);
      
    default:
      return React.createElement("span", { key }, display);
  }
}

// Render a full Entry (string or object) to React elements
export function renderEntry(entry: Entry, keyPrefix: string = "entry"): React.ReactNode {
  if (typeof entry === "string") {
    return parseToReact(entry, keyPrefix);
  }
  
  const obj = entry as EntryObject;
  
  switch (obj.type) {
    case "entries":
      return React.createElement("div", { key: keyPrefix, className: "space-y-2" },
        obj.name && React.createElement("h4", { className: "font-bold text-lg" }, obj.name),
        obj.entries?.map((e, i) => renderEntry(e, `${keyPrefix}-${i}`))
      );
      
    case "list":
      return React.createElement("ul", { key: keyPrefix, className: "list-disc list-inside space-y-1 ml-4" },
        obj.items?.map((item, i) => 
          React.createElement("li", { key: `${keyPrefix}-${i}` }, renderEntry(item, `${keyPrefix}-${i}`))
        )
      );
      
    case "table":
      return React.createElement("table", { key: keyPrefix, className: "w-full border-collapse my-2" },
        obj.colLabels && React.createElement("thead", {},
          React.createElement("tr", {},
            obj.colLabels.map((label, i) => 
              React.createElement("th", { 
                key: `${keyPrefix}-h-${i}`, 
                className: "border border-gray-300 dark:border-gray-600 px-2 py-1 bg-gray-100 dark:bg-gray-800" 
              }, label)
            )
          )
        ),
        React.createElement("tbody", {},
          obj.rows?.map((row, i) => 
            React.createElement("tr", { key: `${keyPrefix}-r-${i}` },
              (row as Entry[]).map((cell, j) => 
                React.createElement("td", { 
                  key: `${keyPrefix}-c-${i}-${j}`, 
                  className: "border border-gray-300 dark:border-gray-600 px-2 py-1" 
                }, renderEntry(cell, `${keyPrefix}-c-${i}-${j}`))
              )
            )
          )
        )
      );
      
    case "inset":
    case "insetReadaloud":
      return React.createElement("blockquote", { 
        key: keyPrefix, 
        className: "border-l-4 border-amber-500 pl-4 py-2 my-2 bg-amber-50 dark:bg-amber-950 italic" 
      },
        obj.name && React.createElement("p", { className: "font-bold not-italic" }, obj.name),
        obj.entries?.map((e, i) => renderEntry(e, `${keyPrefix}-${i}`))
      );
      
    case "quote":
      return React.createElement("blockquote", { 
        key: keyPrefix, 
        className: "border-l-4 border-gray-400 pl-4 py-2 my-2 italic" 
      },
        obj.entries?.map((e, i) => renderEntry(e, `${keyPrefix}-${i}`))
      );
      
    default:
      // Fallback for unknown types
      if (obj.entries) {
        return React.createElement("div", { key: keyPrefix, className: "space-y-2" },
          obj.name && React.createElement("h4", { className: "font-bold" }, obj.name),
          obj.entries.map((e, i) => renderEntry(e, `${keyPrefix}-${i}`))
        );
      }
      return null;
  }
}

// Render multiple entries
export function renderEntries(entries: Entry[], keyPrefix: string = "entries"): React.ReactNode {
  return React.createElement("div", { className: "space-y-3" },
    entries.map((entry, i) => renderEntry(entry, `${keyPrefix}-${i}`))
  );
}
