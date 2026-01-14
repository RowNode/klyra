"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import type { FAQ } from "@/lib/mock-data"

interface FAQProps {
  faqs: FAQ[]
}

export function FAQSection({ faqs }: FAQProps) {
  const [expanded, setExpanded] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpanded(expanded === id ? null : id)
  }

  return (
    <div className="space-y-4">
      {faqs.map((faq) => (
        <div
          key={faq.id}
          className="border border-border bg-card rounded-none shadow-md hover:border-primary/50 hover:shadow-lg transition-all"
        >
          <button
            onClick={() => toggleExpand(faq.id)}
            className="w-full px-6 py-4 flex items-center justify-between text-left"
          >
            <h3 className="font-semibold text-foreground text-lg">{faq.question}</h3>
            <ChevronDown
              className={`w-5 h-5 text-primary transition-transform ${
                expanded === faq.id ? "transform rotate-180" : ""
              }`}
            />
          </button>
          {expanded === faq.id && (
            <div className="p-6 border-t border-border">
              <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
