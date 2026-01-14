import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 border-x-none sm:border-x border-black">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-transparent flex items-center justify-center">
                <Image
                  src="/logo/klyra-logo.png"
                  alt="Sanca"
                  width={32}
                  height={32}
                />
              </div>
              <span className="font-semibold text-foreground">Klyra</span>
            </div>
            <p className="text-sm text-muted-foreground">
              The ultimate quest platform for earning rewards in DeFi.
            </p>
          </div>
          <div className="text-start md:text-end">
            <h4 className="font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/#everything-you-need" className="hover:text-primary">
                  Everything You Need
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-primary">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/#ready-to-begin" className="hover:text-primary">
                  Ready to Begin
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 border-x-none sm:border-x border-t border-black">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 Klyra Circle. All rights reserved.
          </p>
          <div className="flex gap-6">
            {[
              // {
              //   id: 1,
              //   name: "Twitter",
              //   url: "https://x.com/",
              // },
              {
                id: 2,
                name: "GitHub",
                url: "https://github.com/RowNode/klyra",
              },
            ].map((social) => (
              <Link
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary transition"
              >
                {social.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
