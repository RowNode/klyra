"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { EllipsisVertical, LogOut, Copy, Check, Coins } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAccount, useDisconnect, useReadContract } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { getAddress } from "viem";

const KLYRA_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_KLYRA_TOKEN_ADDRESS;
const BADGE_NFT_ADDRESS = process.env.NEXT_PUBLIC_BADGE_NFT_ADDRESS;

// Standard ERC20 ABI for balanceOf
const ERC20_ABI = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export function NavUser() {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("User");
  const [avatar, setAvatar] = useState("https://github.com/evilrabbit.png");
  const [copied, setCopied] = useState(false);

  // Read KLYRA token balance
  const { data: klyraBalance, refetch: refetchKlyraBalance } = useReadContract({
    address: KLYRA_TOKEN_ADDRESS as `0x${string}` | undefined,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [getAddress(address)] : undefined,
    query: {
      enabled: !!address && !!KLYRA_TOKEN_ADDRESS,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  // Format wallet address to show first 6 and last 4 characters
  const formatAddress = (addr: string | undefined) => {
    if (!addr) return "Not connected";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Format MNT balance (18 decimals)
  const formatMNT = (value: bigint | undefined) => {
    if (!value) return "0.00";
    return (Number(value) / 1e18).toFixed(4);
  };

  useEffect(() => {
    async function fetchUserName() {
      if (!address) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const statsResponse = await fetch(`/api/quests/users/${address}/stats`);
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          if (statsData.stats?.name) {
            setUserName(statsData.stats.name);
          } else {
            // Fallback to formatted address if no name
            setUserName(`User ${address.slice(0, 6)}`);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch user name:", err);
        // Fallback to formatted address if fetch fails
        setUserName(`User ${address.slice(0, 6)}`);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserName();
  }, [address]);

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success("Address copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddKlyraToken = async () => {
    try {
      if (typeof window === "undefined") return;

      const provider = (window as any).ethereum;
      if (!provider) {
        toast.error("Ethereum wallet tidak ditemukan di browser.");
        return;
      }

      if (!KLYRA_TOKEN_ADDRESS) {
        toast.error(
          "KLYRA Address Not In Config"
        );
        return;
      }

      const wasAdded = await provider.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: KLYRA_TOKEN_ADDRESS,
            symbol: "KLYRA",
            decimals: 18,
          },
        },
      });

      if (wasAdded) {
        toast.success("Klyra token berhasil ditambahkan ke wallet.");
        // Refetch balance after adding token
        setTimeout(() => {
          refetchKlyraBalance();
        }, 1000);
      } else {
        toast.message(
          "User Cancel."
        );
      }
    } catch (error) {
      console.error("Failed to add Klyra token to wallet:", error);
      toast.error("Failed to add Klyra token to wallet.");
    }
  };

  const handleCopyBadgeNftAddress = async () => {
    try {
      if (!BADGE_NFT_ADDRESS) {
        toast.error(
          "Badge NFT address Not Configured."
        );
        return;
      }

      await navigator.clipboard.writeText(BADGE_NFT_ADDRESS);
      toast.success("Badge NFT address Copied.");
    } catch (error) {
      console.error("Failed to copy badge NFT address:", error);
      toast.error("Failed to copy badge NFT address.");
    }
  };

  const handleDisconnect = () => {
    disconnect();
    router.push("/");
    toast.success("Wallet disconnected");
  };

  if (!isConnected || !address) {
    return null;
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-none">
                  <AvatarImage src={avatar} alt={userName} />
                  <AvatarFallback className="rounded-none">ME</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{userName}</span>
                  <span className="truncate text-xs">
                    {formatAddress(address)}
                  </span>
                </div>
                <EllipsisVertical className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-none">
                    <AvatarImage src={avatar} alt={userName} />
                    <AvatarFallback className="rounded-none">ME</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{userName}</span>
                    <div className="flex items-center justify-between">
                      <span className="truncate text-xs">
                        {formatAddress(address)}
                      </span>

                      {address && (
                        <div
                          onClick={handleCopyAddress}
                          className="cursor-pointer text-muted-foreground"
                          title="Copy address"
                        >
                          {copied ? (
                            <Check className="size-4" />
                          ) : (
                            <Copy className="size-4" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              {/* Token Balances */}
              <div className="px-2 py-1.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Klyra Balance
                  </span>
                  <span className="text-xs font-mono text-foreground">
                    {!KLYRA_TOKEN_ADDRESS
                      ? "N/A"
                      : klyraBalance !== undefined
                      ? `${formatMNT(klyraBalance)} Klyra`
                      : "Loading..."}
                  </span>
                </div>
              </div>

              <DropdownMenuSeparator />

              <DropdownMenuLabel className="text-xs">
                Add to Wallet
              </DropdownMenuLabel>

              <DropdownMenuItem
                className="group"
                onSelect={(event) => {
                  event.preventDefault();
                  handleAddKlyraToken();
                }}
              >
                <Coins className="mr-2 size-4 group-hover:text-white" />
                Add Klyra Token
              </DropdownMenuItem>
              <DropdownMenuItem
                className="group"
                onSelect={(event) => {
                  event.preventDefault();
                  handleCopyBadgeNftAddress();
                }}
              >
                <Copy className="mr-2 size-4 group-hover:text-white" />
                Copy Badge NFT Address
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onSelect={handleDisconnect}
                className="group cursor-pointer hover:text-red-500! hover:bg-transparent!"
              >
                <LogOut className="hover:text-red-500" />
                Disconnect Wallet
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  );
}
