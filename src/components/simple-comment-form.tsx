"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useWriteContract,
  usePublicClient,
  useDisconnect,
} from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, ImageIcon, Hash, Ellipsis, Unplug } from "lucide-react";
import { Editor, type EditorRef } from "@ecp.eth/react-editor/editor";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { InvalidCommentError } from "@ecp.eth/shared/errors";
import type { Hex } from "viem";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  useIndexerSuggestions,
  usePinataUploadFiles,
} from "@ecp.eth/react-editor/hooks";
import { publicEnv } from "@/publicEnv";
import { cn } from "@/lib/utils";
import {
  createCommentData,
  postComment,
  type MetadataEntry as ECPMetadataEntry,
  createMetadataEntry,
  getCommentId,
} from "@ecp.eth/sdk/comments";
import { COMMENT_MANAGER_ADDRESS } from "@ecp.eth/sdk";

import { base } from "wagmi/chains";
import type { PublicClient } from "viem";
import type { UploadTrackerUploadedFile } from "@ecp.eth/react-editor/types";
import type { ContractReadFunctions } from "@ecp.eth/sdk/comments/types";

export const GenerateUploadUrlResponseSchema = z.object({
  url: z.string(),
});

export const ALLOWED_UPLOAD_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
] as const;

export const MAX_UPLOAD_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function createRootCommentsQueryKey(author: Hex, targetUri: string) {
  return ["comments", "root", author, targetUri] as const;
}

function abbreviateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

interface Channel {
  id: string;
  name: string;
  description: string;
  owner: string;
  hook: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  metadata: Array<{
    key: string;
    value: string;
  }>;
  chainId: number;
}

interface MetadataEntry {
  key: string;
  value: string;
  type: string;
}

export function SimpleCommentForm() {
  const { address, isConnected, status } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const { disconnect } = useDisconnect();
  const publicClient = usePublicClient();
  const [targetUri, setTargetUri] = useState("");
  const [metadata, setMetadata] = useState<MetadataEntry[]>([]);
  const [channelId, setChannelId] = useState("");
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoadingChannels, setIsLoadingChannels] = useState(true);
  const [formState, setFormState] = useState<"idle" | "post">("idle");
  const [isDevMode, setIsDevMode] = useState(false);
  const [commentLink, setCommentLink] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const editorRef = useRef<EditorRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploads = usePinataUploadFiles({
    allowedMimeTypes: Array.from(ALLOWED_UPLOAD_MIME_TYPES),
    maxFileSize: MAX_UPLOAD_FILE_SIZE,
    pinataGatewayUrl: publicEnv.NEXT_PUBLIC_PINATA_GATEWAY_URL.replace(
      /^https?:\/\//,
      ""
    ),
    generateUploadUrl: async (filename) => {
      const response = await fetch("/api/generate-upload-url", {
        method: "POST",
        body: JSON.stringify({ filename }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate upload URL");
      }

      const { url } = GenerateUploadUrlResponseSchema.parse(
        await response.json()
      );

      return url;
    },
  });
  const suggestions = useIndexerSuggestions({
    indexerApiUrl: "https://api.ethcomments.xyz",
  });

  const fetchChannels = useCallback(async () => {
    try {
      setIsLoadingChannels(true);
      const params = new URLSearchParams({
        chainId: "8453", // Base chain ID
        limit: "50",
        sort: "desc",
      });

      const response = await fetch(
        `https://api.ethcomments.xyz/api/channels?${params}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch channels: ${response.status}`);
      }

      const data = await response.json();

      // Sort channels to put "home" first if it exists, then reverse the order of non-home channels
      const sortedChannels = data.results.sort((a: Channel, b: Channel) => {
        if (a.name.toLowerCase() === "home") return -1;
        if (b.name.toLowerCase() === "home") return 1;
        return 0;
      });

      // Reverse the order of non-home channels
      const homeChannel = sortedChannels.find(
        (c: Channel) => c.name.toLowerCase() === "home"
      );
      if (homeChannel) {
        const nonHomeChannels = sortedChannels
          .filter((c: Channel) => c.name.toLowerCase() !== "home")
          .reverse();
        const finalChannels = [homeChannel, ...nonHomeChannels];
        setChannels(finalChannels);
      } else {
        setChannels(sortedChannels);
      }

      // Set "home" as default if available, otherwise first channel
      if (sortedChannels.length > 0 && !channelId) {
        const homeChannel = sortedChannels.find(
          (c: Channel) => c.name.toLowerCase() === "home"
        );
        setChannelId(homeChannel ? homeChannel.id : sortedChannels[0].id);
      }
    } catch (err) {
      console.error("Error fetching channels:", err);
    } finally {
      setIsLoadingChannels(false);
    }
  }, [channelId]);

  // Helper function to check if a key is duplicate
  const isDuplicateKey = (key: string, currentIndex: number) => {
    if (!key.trim()) return false;
    return metadata.some(
      (entry, index) =>
        index !== currentIndex && entry.key.trim() === key.trim()
    );
  };

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  // Automatically switch to Base when user connects
  useEffect(() => {
    if (isConnected && chainId !== base.id) {
      switchChainAsync({ chainId: base.id }).catch((error) => {
        console.error("Failed to switch to Base chain:", error);
        toast.error("Please switch to Base network to continue");
      });
    }
  }, [isConnected, chainId, switchChainAsync]);

  // Store channelId to prefill
  const [channelIdToPrefill, setChannelIdToPrefill] = useState<string | null>(
    null
  );

  // Parse query parameters and prefill form
  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);

    // Check for dev mode
    const devParam = urlParams.get("__dev");
    if (devParam === "true") {
      setIsDevMode(true);
    }

    // Prefill targetUri
    const targetUriParam = urlParams.get("targetUri");
    if (targetUriParam) {
      const decodedTargetUri = decodeURIComponent(targetUriParam);
      console.log("Setting targetUri:", decodedTargetUri);
      setTargetUri(decodedTargetUri);
    }

    // Store channelId to prefill after channels are loaded
    const channelIdParam = urlParams.get("channelId");
    if (channelIdParam) {
      console.log("ChannelId to prefill:", channelIdParam);
      setChannelIdToPrefill(channelIdParam);
    }

    // Handle metadata
    const metadataParam = urlParams.get("metadata");
    if (metadataParam) {
      const metadataEntries: MetadataEntry[] = [];
      const entries = metadataParam.split(",");

      for (const entry of entries) {
        const [key, value, type = "string"] = entry.split(":");
        if (key && value) {
          metadataEntries.push({
            key: decodeURIComponent(key),
            value: decodeURIComponent(value),
            type: decodeURIComponent(type),
          });
        }
      }

      if (metadataEntries.length > 0) {
        console.log("Setting metadata:", metadataEntries);
        setMetadata(metadataEntries);
      }
    }
  }, []);

  // Store content to prefill
  const [contentToPrefill, setContentToPrefill] = useState<string | null>(null);

  // Parse content parameter and store it
  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const contentParam = urlParams.get("content");

    if (contentParam) {
      const decodedContent = decodeURIComponent(contentParam);
      console.log("Content to prefill:", decodedContent);
      setContentToPrefill(decodedContent);
    }
  }, []);

  // Prefill editor content when editor is ready
  useEffect(() => {
    if (contentToPrefill && editorRef.current?.editor) {
      console.log("Editor ready, setting content:", contentToPrefill);
      editorRef.current.editor.commands.setContent(contentToPrefill);
      setContentToPrefill(null); // Clear after setting
    }
  }, [contentToPrefill, editorRef.current?.editor]);

  // Set channelId after channels are loaded
  useEffect(() => {
    if (channelIdToPrefill && channels.length > 0 && !isLoadingChannels) {
      console.log("Channels loaded, setting channelId:", channelIdToPrefill);
      setChannelId(channelIdToPrefill);
      setChannelIdToPrefill(null); // Clear after setting
    }
  }, [channelIdToPrefill, channels.length, isLoadingChannels]);

  // Add this helper function to get commentId from contract events
  const getCommentIdFromTransaction = async (
    txHash: string,
    publicClient: PublicClient
  ): Promise<string | null> => {
    try {
      // Get transaction receipt
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash as `0x${string}`,
      });

      // Heuristic: extract possible commentId from logs emitted by the comment manager contract
      // Many contracts emit an indexed bytes32 id as the first indexed parameter, which becomes topics[1]
      const managerAddress = (
        COMMENT_MANAGER_ADDRESS as `0x${string}`
      ).toLowerCase();
      for (const log of receipt.logs ?? []) {
        // Some clients may not always normalize case; ensure lowercase compare
        if (log.address && log.address.toLowerCase() === managerAddress) {
          if (Array.isArray(log.topics) && log.topics.length >= 2) {
            const possibleId = log.topics[1];
            if (typeof possibleId === "string" && possibleId.startsWith("0x")) {
              return possibleId;
            }
          }
        }
      }

      return null;
    } catch (error) {
      console.warn("Failed to get commentId from receipt logs:", error);
      return null;
    }
  };

  const submitMutation = useMutation({
    mutationFn: async (
      formData: FormData
    ): Promise<{ txHash: string; commentId: string }> => {
      try {
        const submitAction = formData.get("action") as "post";

        setFormState(submitAction);

        // Debug logging
        console.log("Starting comment submission:", {
          chainId,
          address,
          isConnected,
          channelId,
          targetUri,
          hasEditor: !!editorRef.current?.editor,
          metadataCount: metadata.length,
        });

        if (!editorRef.current?.editor) {
          throw new Error("Editor is not initialized");
        }

        const filesToUpload = editorRef.current?.getFilesForUpload() || [];

        await uploads.uploadFiles(filesToUpload, {
          onSuccess(uploadedFile: UploadTrackerUploadedFile) {
            editorRef.current?.setFileAsUploaded(uploadedFile);
          },
          onError(fileId: string) {
            editorRef.current?.setFileUploadAsFailed(fileId);
          },
        });

        // validate content
        const content = z
          .string()
          .trim()
          .parse(
            editorRef.current.editor.getText({
              blockSeparator: "\n",
            })
          );

        // Validate required fields
        if (!content) {
          throw new Error("Comment content cannot be empty");
        }

        if (!channelId) {
          throw new Error("Please select a channel");
        }

        console.log("Content validation passed:", {
          contentLength: content.length,
          channelId,
          hasContent: !!content,
        });

        // Ensure we're on the correct chain (Base)
        if (chainId !== base.id) {
          await switchChainAsync({ chainId: base.id });
        }

        if (!address) {
          throw new Error("No wallet address available");
        }

        // Convert metadata to ECP format
        const ecpMetadata: ECPMetadataEntry[] = metadata
          .filter((entry) => entry.key.trim() && entry.value.trim())
          .map((entry) => {
            return createMetadataEntry(
              entry.key,
              entry.type as
                | "string"
                | "uint256"
                | "int256"
                | "address"
                | "bool"
                | "bytes"
                | "bytes32",
              entry.value
            );
          });

        const signResponse = await fetch(
          // Deploy your own signer service to Vercel in 1 click: https://github.com/ecp-eth/comments-monorepo/tree/main/examples/signer
          "https://share-ethcomments-signer-service.vercel.app/api/post-comment/sign",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              author: address,
              content,
              channelId,
              metadata: ecpMetadata,
              targetUri: targetUri || window.location.href,
            }),
          }
        );

        if (!signResponse.ok) {
          const errorText = await signResponse.text();
          console.error("Signer service error:", errorText);
          throw new Error(
            `Failed to get app signature: ${signResponse.status} ${errorText}`
          );
        }

        const signResult = await signResponse.json();

        // Create comment data using ECP SDK
        const commentData = createCommentData(signResult.data);
        // Pre-compute deterministic commentId from comment data (contract view)
        let precomputedCommentId: string | null = null;
        try {
          if (publicClient) {
            const readContract: ContractReadFunctions["getCommentId"] = (
              args
            ) => publicClient.readContract(args);
            const cid = await getCommentId({
              commentData: signResult.data,
              // The SDK expects viem-compatible readContract
              readContract,
            });
            precomputedCommentId = cid as unknown as string;
          }
        } catch (pcErr) {
          console.warn(
            "Failed to precompute commentId via getCommentId:",
            pcErr
          );
        }

        // Post comment using ECP SDK with app signature
        const result = await postComment({
          comment: commentData,
          appSignature: signResult.signature,
          writeContract: async (args) => {
            console.log("writeContract called with args:", {
              functionName: args.functionName,
              argsLength: args.args?.length || 0,
              value: args.value?.toString() || "0",
            });
            return await writeContractAsync({
              address: COMMENT_MANAGER_ADDRESS,
              abi: args.abi,
              functionName: args.functionName,
              args: args.args,
              value: args.value,
            });
          },
        });

        // Always try to get the commentId
        let commentId: string | null = null;

        // First try to get it from transaction confirmation
        if (publicClient) {
          try {
            const commentData = await result.wait({
              getContractEvents: publicClient.getContractEvents,
              waitForTransactionReceipt: publicClient.waitForTransactionReceipt,
            });
            console.log("Transaction confirmed:", result.txHash);
            console.log("Comment data:", commentData);
            commentId = commentData?.commentId || null;
          } catch (waitError) {
            console.warn(
              "Transaction confirmation failed, but txHash is available:",
              waitError
            );
          }
        }

        // If we still don't have commentId, try to get it manually from contract events
        if (!commentId && publicClient) {
          commentId = await getCommentIdFromTransaction(
            result.txHash,
            publicClient
          );
        }

        // If we still don't have commentId, fall back to precomputed value
        if (!commentId && precomputedCommentId) {
          commentId = precomputedCommentId;
        }

        // If we still don't have commentId, throw an error
        if (!commentId) {
          throw new Error("Failed to retrieve commentId from transaction");
        }

        return {
          txHash: result.txHash,
          commentId: commentId,
        };
      } catch (e) {
        console.error("Error in comment submission:", {
          error: e,
          errorType: e?.constructor?.name,
          errorMessage: e instanceof Error ? e.message : String(e),
          stack: e instanceof Error ? e.stack : undefined,
          chainId,
          address,
          isConnected,
          channelId,
          targetUri,
          content:
            editorRef.current?.editor?.getText({ blockSeparator: "\n" }) ||
            "No content",
        });

        if (e instanceof z.ZodError) {
          throw new InvalidCommentError(
            e.flatten().fieldErrors as Record<string, string[]>
          );
        }

        throw e;
      } finally {
        setFormState("idle");
      }
    },
    onSuccess(result) {
      editorRef.current?.clear();
      submitMutation.reset();
      setTargetUri("");
      setMetadata([]);

      console.log("Result:", result);

      const commentId = result.commentId;
      const commentLink = `https://calink.steer.fun/c/${commentId}`;
      setCommentLink(commentLink);
      setTxHash(result.txHash);
    },
    onError(error) {
      if (error instanceof InvalidCommentError) {
        editorRef.current?.focus();
      }

      // Enhanced error logging
      console.error("Comment submission error:", error);

      // Provide more specific error messages
      let errorMessage = "Failed to post comment";

      if (error instanceof Error) {
        errorMessage = error.message;

        // Handle specific error types
        if (error.message.includes("Failed to get app signature")) {
          errorMessage = "Failed to sign comment. Please try again.";
        } else if (error.message.includes("insufficient funds")) {
          errorMessage = "Insufficient funds for transaction";
        } else if (error.message.includes("user rejected")) {
          errorMessage = "Transaction was rejected by user";
        } else if (error.message.includes("network")) {
          errorMessage = "Network error. Please check your connection";
        } else if (error.message.includes("chain")) {
          errorMessage = "Please switch to Base network";
        } else if (error.message.includes("content")) {
          errorMessage = "Comment cannot be empty";
        } else if (error.message === "No wallet address available") {
          errorMessage = "Please connect your wallet";
        } else if (
          error.message.includes("InvalidInputRpcError") ||
          error.message.includes("invalid block range")
        ) {
          errorMessage =
            "Transaction submitted successfully! Check your wallet for confirmation.";
        }
      }

      toast.error(errorMessage);
    },
  });

  const isSubmitting = submitMutation.isPending;

  // Generate share URL from current form state
  const generateShareUrl = useCallback(() => {
    const params = new URLSearchParams();

    if (targetUri) {
      params.set("targetUri", targetUri);
    }

    if (channelId) {
      params.set("channelId", channelId);
    }

    const content =
      editorRef.current?.editor?.getText({ blockSeparator: "\n" }) || "";
    if (content.trim()) {
      params.set("content", content.trim());
    }

    if (metadata.length > 0) {
      const metadataString = metadata
        .filter((entry) => entry.key.trim() && entry.value.trim())
        .map((entry) => `${entry.key}:${entry.value}:${entry.type}`)
        .join(",");
      if (metadataString) {
        params.set("metadata", metadataString);
      }
    }

    const baseUrl = window.location.origin + window.location.pathname;
    return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
  }, [targetUri, channelId, metadata]);

  // Copy share URL to clipboard
  const copyShareUrl = useCallback(async () => {
    try {
      const shareUrl = generateShareUrl();
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Share URL copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast.error("Failed to copy to clipboard");
    }
  }, [generateShareUrl]);

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      let files = Array.from(event.target.files || []);

      if (files.length === 0) {
        return;
      }

      let removedDueToMimeType = 0;
      let removedDueToSize = 0;

      files = files.filter((file) => {
        if (
          !ALLOWED_UPLOAD_MIME_TYPES.includes(
            file.type as (typeof ALLOWED_UPLOAD_MIME_TYPES)[number]
          )
        ) {
          removedDueToMimeType++;

          return false;
        }

        if (file.size > MAX_UPLOAD_FILE_SIZE) {
          removedDueToSize++;

          return false;
        }

        return true;
      });

      if (removedDueToMimeType > 0 || removedDueToSize) {
        toast.error("Some files were removed", {
          description: "Some files were removed due to file type or size",
        });
      }

      if (files.length === 0) {
        return;
      }

      editorRef.current?.addFiles(files);

      // Reset the input so the same file can be selected again
      event.target.value = "";
    },
    []
  );

  const handleAddFileClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <form
      action={async (formData: FormData) => {
        try {
          await submitMutation.mutateAsync(formData);
        } catch {
          /* empty - handled by useMutation */
        }
      }}
      className="space-y-4"
    >
      <div className="flex justify-between items-center">
        {status === "disconnected" && !isConnected && <ConnectButton />}

        {address ? (
          <div className="flex items-center gap-4 text-sm text-muted-foreground ml-auto">
            <div className="flex items-center gap-2 text-sm">
              {address.slice(0, 6)}...{address.slice(-4)}
            </div>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => disconnect()}
              className="text-xs"
            >
              <Unplug className="h-4 w-4" />
            </Button>
            {/* <div className="flex items-center gap-2">
                    <span>Network:</span>
                    <code
                      className={`text-xs px-2 py-1 rounded ${
                        chainId === base.id
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      }`}
                    >
                      {chainId === base.id ? "Base" : "Wrong Network"}
                    </code>
                  </div> */}
          </div>
        ) : (
          (status === "connecting" || status === "reconnecting") && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground ml-auto">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 dark:border-gray-100"></div>
            </div>
          )
        )}
      </div>
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ALLOWED_UPLOAD_MIME_TYPES.join(",")}
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="space-y-6">
            <Editor
              className={cn(
                "w-full p-2 rounded min-h-[200px] border-none shadow-none",
                submitMutation.error &&
                  submitMutation.error instanceof InvalidCommentError &&
                  "border-destructive focus-visible:border-destructive"
              )}
              disabled={isSubmitting}
              placeholder="Write your comment here..."
              ref={editorRef}
              suggestions={suggestions}
              uploads={uploads}
            />

            <div className="flex gap-2 justify-between items-center">
              <div className="flex gap-2 items-center w-full">
                <Button
                  aria-label="Add media"
                  variant="ghost"
                  type="button"
                  onClick={handleAddFileClick}
                  disabled={isSubmitting}
                >
                  <ImageIcon />
                </Button>

                {/* Channel Popover */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      disabled={isSubmitting}
                      className="flex items-center gap-2"
                    >
                      <Hash className="h-4 w-4" />
                      {channelId !== "0" &&
                      channels.find((c) => c.id === channelId)?.name
                        ? abbreviateText(
                            channels.find((c) => c.id === channelId)?.name ||
                              "",
                            10
                          )
                        : null}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <h4 className="font-medium leading-none">Channel</h4>
                      <div className="space-y-2">
                        <Select value={channelId} onValueChange={setChannelId}>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                isLoadingChannels
                                  ? "Loading channels..."
                                  : "Select a channel"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {channels.map((channel) => (
                              <SelectItem key={channel.id} value={channel.id}>
                                {channel.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground">
                          Channels can set smart contract hooks for additional
                          functionality, fees, gating and validation. The
                          default &apos;home&apos; channel has no hook.{" "}
                          <a
                            href="https://ecp-channel-tool.vercel.app"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                          >
                            Learn more about channels
                          </a>
                          .
                        </p>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* More Options Popover */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      disabled={isSubmitting}
                      className="flex items-center gap-2"
                    >
                      <Ellipsis className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-96">
                    <div className="space-y-6">
                      {/* Target URI Section */}
                      <div className="space-y-4">
                        <h4 className="font-medium leading-none">Target</h4>
                        <div className="space-y-2">
                          <Input
                            value={targetUri}
                            onChange={(e) => setTargetUri(e.target.value)}
                            placeholder="https://example.com or ipfs://..."
                          />
                          <p className="text-sm text-muted-foreground">
                            The URL this comment is about
                          </p>
                        </div>
                      </div>

                      {/* Metadata Section */}
                      <div className="space-y-4">
                        <h4 className="font-medium leading-none">Metadata</h4>
                        <div className="space-y-3">
                          {metadata.map((entry, index) => (
                            <div key={index} className="flex gap-2 items-start">
                              <div className="flex-1">
                                <Input
                                  placeholder="Key"
                                  value={entry.key}
                                  onChange={(e) => {
                                    const newMetadata = [...metadata];
                                    newMetadata[index].key = e.target.value;
                                    setMetadata(newMetadata);
                                  }}
                                  className={
                                    isDuplicateKey(entry.key, index)
                                      ? "border-red-500"
                                      : ""
                                  }
                                />
                                {isDuplicateKey(entry.key, index) && (
                                  <p className="text-xs text-red-500 mt-1">
                                    Duplicate key
                                  </p>
                                )}
                              </div>
                              <div className="flex-1">
                                <Input
                                  placeholder="Value"
                                  value={entry.value}
                                  onChange={(e) => {
                                    const newMetadata = [...metadata];
                                    newMetadata[index].value = e.target.value;
                                    setMetadata(newMetadata);
                                  }}
                                />
                              </div>
                              <div className="w-32">
                                <Select
                                  value={entry.type}
                                  onValueChange={(value) => {
                                    const newMetadata = [...metadata];
                                    newMetadata[index].type = value;
                                    setMetadata(newMetadata);
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="string">
                                      string
                                    </SelectItem>
                                    <SelectItem value="uint256">
                                      uint256
                                    </SelectItem>
                                    <SelectItem value="int256">
                                      int256
                                    </SelectItem>
                                    <SelectItem value="address">
                                      address
                                    </SelectItem>
                                    <SelectItem value="bool">bool</SelectItem>
                                    <SelectItem value="bytes">bytes</SelectItem>
                                    <SelectItem value="bytes32">
                                      bytes32
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newMetadata = metadata.filter(
                                    (_, i) => i !== index
                                  );
                                  setMetadata(newMetadata);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setMetadata([
                                ...metadata,
                                { key: "", value: "", type: "string" },
                              ]);
                            }}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4" />
                            Add Metadata Entry
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Add key-value pairs with Solidity types. Keys must be
                          unique.
                        </p>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                {isDevMode ? (
                  <Button
                    type="button"
                    onClick={copyShareUrl}
                    className="ml-auto"
                    disabled={isSubmitting}
                  >
                    <Image
                      src="/logo-dark.svg"
                      alt="Logo"
                      width={16}
                      height={16}
                    />
                    Copy Share URL
                  </Button>
                ) : (
                  <Button
                    name="action"
                    value="post"
                    type="submit"
                    className="ml-auto"
                    disabled={isSubmitting || chainId !== base.id}
                  >
                    <Image
                      src="/logo-dark.svg"
                      alt="Logo"
                      width={16}
                      height={16}
                    />
                    {formState === "post"
                      ? "Check your wallet..."
                      : "Share to ECP"}
                  </Button>
                )}
              </div>
            </div>
            {/* 
            {submitMutation.error && (
              <CommentFormErrors error={submitMutation.error} />
            )} */}

            {isConnected && chainId !== base.id && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-900/20 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ You&apos;re connected to the wrong network. Please switch
                  to Base network to post comments.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Comment Link Display */}
      {commentLink && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                Posted Successfully!
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                View your comment:
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(commentLink);
                toast.success("Link copied to clipboard!");
              }}
              className="text-green-700 dark:text-green-300 border-green-300 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-800"
            >
              Copy Link
            </Button>
          </div>
          <a
            href={commentLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-2 text-sm text-green-600 font-bold dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 break-all"
          >
            {commentLink}
          </a>

          {/* BaseScan Link */}
          <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-700">
            <p className="text-sm text-green-700 dark:text-green-300 mb-2">
              View transaction:
            </p>
            <a
              href={`https://basescan.org/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-2 text-sm text-green-600 font-bold dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 break-all"
            >
              https://basescan.org/tx/{txHash}
            </a>
          </div>
        </div>
      )}
    </form>
  );
}
