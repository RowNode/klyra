"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"
import Image from "next/image"
import { Button } from "./ui/button"

export function Navbar() {
  const pathname = usePathname()
  const { isConnected, address } = useAccount()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="border-b border-black bg-background/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 border-x-none sm:border-x border-black">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 bg-transparent flex items-center justify-center">
              <Image src="/logo/klyra-logo.png" alt="Klyra" width={32} height={32} />
            </div>
            <span className="hidden sm:inline text-foreground">Klyra</span>
          </Link>

          {/* Menu Items */}
          {/* <div className="hidden md:flex items-center gap-1">
            <Link href="/">
              <Button variant={isActive("/") ? "default" : "ghost"} className="text-sm">
                Home
              </Button>
            </Link>
            <Link href="/quests">
              <Button variant={isActive("/quests") ? "default" : "ghost"} className="text-sm">
                Quests
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button variant={isActive("/leaderboard") ? "default" : "ghost"} className="text-sm">
                Leaderboard
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant={isActive("/profile") ? "default" : "ghost"} className="text-sm">
                Profile
              </Button>
            </Link>
          </div> */}

          {/* Wallet Connect */}
          <div className="flex items-center gap-4">
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                authenticationStatus,
                mounted,
              }) => {
                const ready = mounted && authenticationStatus !== "loading"
                const connected =
                  ready &&
                  account &&
                  chain &&
                  (!authenticationStatus ||
                    authenticationStatus === "authenticated")

                return (
                  <div
                    {...(!ready && {
                      "aria-hidden": true,
                      style: {
                        opacity: 0,
                        pointerEvents: "none",
                        userSelect: "none",
                      },
                    })}
                  >
                    {(() => {
                      if (!connected) {
                        return (
                          <Button
                            onClick={openConnectModal}
                            variant="default"
                            type="button"
                          >
                            Connect Wallet
                          </Button>
                        )
                      }

                      if (chain.unsupported) {
                        return (
                          <Button
                            onClick={openChainModal}
                            type="button"
                            variant="default"
                          >
                            Wrong network
                          </Button>
                        )
                      }

                      return (
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={openChainModal}
                            type="button"
                            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/20 border border-secondary hover:bg-secondary/30 transition-colors"
                          >
                            {chain.hasIcon && (
                              <div
                                style={{
                                  background: chain.iconBackground,
                                  width: 16,
                                  height: 16,
                                  borderRadius: 999,
                                  overflow: "hidden",
                                  marginRight: 4,
                                }}
                              >
                                {chain.iconUrl && (
                                  <img
                                    alt={chain.name ?? "Chain icon"}
                                    src={chain.iconUrl}
                                    style={{ width: 16, height: 16 }}
                                  />
                                )}
                              </div>
                            )}
                            <span className="text-sm font-mono text-foreground">{chain.name}</span>
                          </Button>

                          <Button
                            onClick={openAccountModal}
                            type="button"
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/20 border border-secondary hover:bg-secondary/30 transition-colors"
                          >
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-sm font-mono text-foreground">
                              {account.displayName}
                            </span>
                          </Button>
                        </div>
                      )
                    })()}
                  </div>
                )
              }}
            </ConnectButton.Custom>
          </div>
        </div>
      </div>
    </nav>
  )
}
