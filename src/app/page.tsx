"use client";

import {
  BookOpen,
  GitMerge,
  Pencil,
  Plus,
  RefreshCcw,
  Trash2,
  Unplug,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatUnits, type Address } from "viem";
import {
  useAccount,
  useBalance,
  useConnect,
  useDisconnect,
  useReadContract,
  useReadContracts,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { base } from "wagmi/chains";
import {
  FATEBOOK_ABI,
  FATEBOOK_CONTRACT_ADDRESS,
} from "@/lib/contract";
import { BUILDER_DATA_SUFFIX } from "@/lib/wagmi";
import styles from "./page.module.css";

type Fate = {
  id: bigint;
  title: string;
  content: string;
  path: string;
  mergeCount: bigint;
  createdAt: bigint;
  exists: boolean;
};

const prompts = [
  {
    title: "The Brass Door",
    content:
      "A quiet door opens when you choose the slower road. The reward is clarity before speed.",
    path: "Patience / Signal / First Light",
  },
  {
    title: "Palm Line Rewritten",
    content:
      "The line in your palm bends toward a new ally. Say yes to the conversation you nearly skip.",
    path: "Chance / Ally / Second Branch",
  },
  {
    title: "Midnight Ledger",
    content:
      "A small decision becomes durable because you wrote it down. Your next chapter starts with proof.",
    path: "Record / Proof / Open Gate",
  },
  {
    title: "Fork of Ember",
    content:
      "The bright route is not the loud route. Pick the option that keeps your future editable.",
    path: "Ember / Choice / Return",
  },
];

function shorten(address?: Address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function toFate(value: unknown): Fate | null {
  if (!Array.isArray(value)) return null;
  const [id, title, content, path, mergeCount, createdAt, exists] = value;
  if (!exists) return null;
  return { id, title, content, path, mergeCount, createdAt, exists };
}

export default function Home() {
  const { address, chainId, isConnected } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync, data: hash, isPending } = useWriteContract();
  const [mode, setMode] = useState<"create" | "edit" | "merge" | "reset">(
    "create",
  );
  const [selectedId, setSelectedId] = useState("0");
  const [mergeA, setMergeA] = useState("0");
  const [mergeB, setMergeB] = useState("1");
  const [status, setStatus] = useState("Ready to write your first fate.");
  const [draft, setDraft] = useState(prompts[0]);

  const isBaseApp = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return /base/i.test(navigator.userAgent);
  }, []);

  const { data: balance } = useBalance({
    address,
    chainId: base.id,
    query: { enabled: Boolean(address) },
  });

  const { data: fateCountData, refetch: refetchFateCount } = useReadContract({
    address: FATEBOOK_CONTRACT_ADDRESS,
    abi: FATEBOOK_ABI,
    functionName: "fateCount",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) },
  });

  const { data: interactionCountData, refetch: refetchInteractions } =
    useReadContract({
      address: FATEBOOK_CONTRACT_ADDRESS,
      abi: FATEBOOK_ABI,
      functionName: "interactionCount",
      args: address ? [address] : undefined,
      query: { enabled: Boolean(address) },
    });

  const fateCount = fateCountData ?? 0n;
  const fateIndexes = useMemo(
    () => Array.from({ length: Number(fateCount) }, (_, index) => BigInt(index)),
    [fateCount],
  );

  const { data: fateReads, refetch: refetchFates } = useReadContracts({
    contracts: fateIndexes.map((fateId) => ({
      address: FATEBOOK_CONTRACT_ADDRESS,
      abi: FATEBOOK_ABI,
      functionName: "getFate",
      args: [address as Address, fateId],
    })),
    query: { enabled: Boolean(address) && fateIndexes.length > 0 },
  });

  const fates = useMemo(
    () =>
      (fateReads ?? [])
        .map((result) => toFate(result.result))
        .filter((fate): fate is Fate => Boolean(fate))
        .reverse(),
    [fateReads],
  );

  const receipt = useWaitForTransactionReceipt({
    hash,
    query: { enabled: Boolean(hash) },
  });

  useEffect(() => {
    if (!isConnected && isBaseApp) {
      const injectedConnector = connectors.find((connector) =>
        connector.name.toLowerCase().includes("injected"),
      );
      if (injectedConnector) connect({ connector: injectedConnector });
    }
  }, [connect, connectors, isBaseApp, isConnected]);

  useEffect(() => {
    if (receipt.isSuccess) {
      refetchFateCount();
      refetchInteractions();
      refetchFates();
    }
  }, [
    receipt.isSuccess,
    refetchFateCount,
    refetchFates,
    refetchInteractions,
  ]);

  function randomizeDraft() {
    const next = prompts[Math.floor(Math.random() * prompts.length)];
    setDraft(next);
    setStatus("A fresh branch is ready. Write it onchain when you choose.");
  }

  async function ensureBase() {
    if (chainId !== base.id) await switchChainAsync({ chainId: base.id });
  }

  async function writeFate() {
    if (!isConnected) {
      setStatus("Connect a wallet to begin your onchain FateBook.");
      return;
    }
    await ensureBase();
    setStatus("Waiting for your wallet signature.");

    try {
      if (mode === "create") {
        await writeContractAsync({
          address: FATEBOOK_CONTRACT_ADDRESS,
          abi: FATEBOOK_ABI,
          functionName: "createFate",
          args: [draft.title, draft.content, draft.path],
          chainId: base.id,
          dataSuffix: BUILDER_DATA_SUFFIX,
        });
      }
      if (mode === "edit") {
        await writeContractAsync({
          address: FATEBOOK_CONTRACT_ADDRESS,
          abi: FATEBOOK_ABI,
          functionName: "editFate",
          args: [
            BigInt(selectedId || "0"),
            draft.title,
            draft.content,
            draft.path,
          ],
          chainId: base.id,
          dataSuffix: BUILDER_DATA_SUFFIX,
        });
      }
      if (mode === "merge") {
        await writeContractAsync({
          address: FATEBOOK_CONTRACT_ADDRESS,
          abi: FATEBOOK_ABI,
          functionName: "mergeFates",
          args: [BigInt(mergeA || "0"), BigInt(mergeB || "1")],
          chainId: base.id,
          dataSuffix: BUILDER_DATA_SUFFIX,
        });
      }
      if (mode === "reset") {
        await writeContractAsync({
          address: FATEBOOK_CONTRACT_ADDRESS,
          abi: FATEBOOK_ABI,
          functionName: "resetFateBook",
          chainId: base.id,
          dataSuffix: BUILDER_DATA_SUFFIX,
        });
      }
      setStatus("Broadcasting to Base. Your reward appears after confirmation.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Transaction cancelled.";
      setStatus(message.slice(0, 140));
    }
  }

  async function deleteFate(fateId: bigint) {
    if (!isConnected) return;
    await ensureBase();
    await writeContractAsync({
      address: FATEBOOK_CONTRACT_ADDRESS,
      abi: FATEBOOK_ABI,
      functionName: "deleteFate",
      args: [fateId],
      chainId: base.id,
      dataSuffix: BUILDER_DATA_SUFFIX,
    });
    setStatus("Delete transaction sent. The branch will disappear after confirmation.");
  }

  const visibleStatus = receipt.isSuccess
    ? "Confirmed on Base. Your FateBook has a new permanent mark."
    : receipt.isLoading
      ? "Base is confirming your transaction."
      : status;

  const primaryLabel = {
    create: "Write My Fate",
    edit: "Rewrite Selected Fate",
    merge: "Merge Two Branches",
    reset: "Reset FateBook",
  }[mode];

  return (
    <div className={styles.page}>
      <main className={styles.shell}>
        <section className={styles.hero}>
          <nav className={styles.nav}>
            <div className={styles.brand}>FateBook</div>
            <button
              className={styles.walletPill}
              onClick={() => (isConnected ? disconnect() : undefined)}
              type="button"
            >
              {isConnected ? <Unplug size={16} /> : <Wallet size={16} />}
              {isConnected ? shorten(address) : "No wallet"}
            </button>
          </nav>

          <div className={styles.scene} aria-hidden="true">
            <div className={styles.door} />
            <div className={styles.palm}>
              <div className={`${styles.finger} ${styles.fingerOne}`} />
              <div className={`${styles.finger} ${styles.fingerTwo}`} />
              <div className={`${styles.finger} ${styles.fingerThree}`} />
              <div className={`${styles.finger} ${styles.fingerFour}`} />
              <div className={`${styles.finger} ${styles.thumb}`} />
              <div className={styles.palmBase} />
              <div className={styles.line} />
            </div>
          </div>

          <div className={styles.heroContent}>
            <h1 className={styles.title}>FateBook</h1>
            <p className={styles.subtitle}>
              Create endless onchain fate pages, rewrite choices, merge life
              branches, and reset the path. No token purchase, no daily limit,
              only Base gas.
            </p>
          </div>
        </section>

        <section className={styles.panel} aria-label="FateBook actions">
          <div className={styles.stats}>
            <div className={styles.stat}>
              <strong>{fateCount.toString()}</strong>
              <span>Fate pages</span>
            </div>
            <div className={styles.stat}>
              <strong>{(interactionCountData ?? 0n).toString()}</strong>
              <span>Interactions</span>
            </div>
            <div className={styles.stat}>
              <strong>
                {balance
                  ? Number(formatUnits(balance.value, balance.decimals)).toFixed(4)
                  : "0.0000"}
              </strong>
              <span>Base ETH</span>
            </div>
          </div>

          {!isConnected ? (
            <div className={styles.walletSheet}>
              {connectors.map((connector) => (
                <button
                  className={styles.walletButton}
                  disabled={isConnecting}
                  key={connector.uid}
                  onClick={() => connect({ connector })}
                  type="button"
                >
                  <span>{connector.name}</span>
                  <Wallet size={18} />
                </button>
              ))}
            </div>
          ) : (
            <>
              <div className={styles.tabs}>
                {(["create", "edit", "merge", "reset"] as const).map((item) => (
                  <button
                    className={`${styles.tabButton} ${
                      mode === item ? styles.activeTab : ""
                    }`}
                    key={item}
                    onClick={() => setMode(item)}
                    type="button"
                  >
                    {item}
                  </button>
                ))}
              </div>

              {mode !== "reset" && mode !== "merge" ? (
                <div className={styles.form}>
                  {mode === "edit" ? (
                    <label className={styles.label}>
                      Fate ID
                      <select
                        className={styles.select}
                        value={selectedId}
                        onChange={(event) => setSelectedId(event.target.value)}
                      >
                        {fates.map((fate) => (
                          <option
                            key={fate.id.toString()}
                            value={fate.id.toString()}
                          >
                            #{fate.id.toString()} {fate.title}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : null}
                  <label className={styles.label}>
                    Title
                    <input
                      className={styles.input}
                      value={draft.title}
                      onChange={(event) =>
                        setDraft({ ...draft, title: event.target.value })
                      }
                    />
                  </label>
                  <label className={styles.label}>
                    Content
                    <textarea
                      className={styles.textarea}
                      value={draft.content}
                      onChange={(event) =>
                        setDraft({ ...draft, content: event.target.value })
                      }
                    />
                  </label>
                  <label className={styles.label}>
                    Path
                    <input
                      className={styles.input}
                      value={draft.path}
                      onChange={(event) =>
                        setDraft({ ...draft, path: event.target.value })
                      }
                    />
                  </label>
                </div>
              ) : null}

              {mode === "merge" ? (
                <div className={styles.form}>
                  <label className={styles.label}>
                    First branch
                    <select
                      className={styles.select}
                      value={mergeA}
                      onChange={(event) => setMergeA(event.target.value)}
                    >
                      {fates.map((fate) => (
                        <option
                          key={fate.id.toString()}
                          value={fate.id.toString()}
                        >
                          #{fate.id.toString()} {fate.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={styles.label}>
                    Second branch
                    <select
                      className={styles.select}
                      value={mergeB}
                      onChange={(event) => setMergeB(event.target.value)}
                    >
                      {fates.map((fate) => (
                        <option
                          key={fate.id.toString()}
                          value={fate.id.toString()}
                        >
                          #{fate.id.toString()} {fate.title}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              ) : null}

              <div className={styles.controls}>
                <button
                  className={styles.primaryButton}
                  disabled={isPending || receipt.isLoading}
                  onClick={writeFate}
                  type="button"
                >
                  {mode === "merge" ? <GitMerge size={19} /> : <BookOpen size={19} />}
                  {primaryLabel}
                </button>
                <button
                  aria-label="Generate fate"
                  className={styles.iconButton}
                  disabled={mode === "merge" || mode === "reset"}
                  onClick={randomizeDraft}
                  title="Generate fate"
                  type="button"
                >
                  <RefreshCcw size={18} />
                </button>
                <button
                  aria-label="Create mode"
                  className={styles.iconButton}
                  onClick={() => setMode("create")}
                  title="Create mode"
                  type="button"
                >
                  <Plus size={18} />
                </button>
              </div>
            </>
          )}

          <div className={styles.preview}>
            <span className={styles.path}>{draft.path}</span>
            <h2>{draft.title}</h2>
            <p>{draft.content}</p>
          </div>

          <div className={styles.status}>{visibleStatus}</div>

          <div className={styles.fateGrid}>
            {fates.slice(0, 4).map((fate) => (
              <article className={styles.fateCard} key={fate.id.toString()}>
                <header>
                  <h3>
                    #{fate.id.toString()} {fate.title}
                  </h3>
                  <div className={styles.cardActions}>
                    <button
                      aria-label="Edit fate"
                      className={styles.iconButton}
                      onClick={() => {
                        setSelectedId(fate.id.toString());
                        setDraft({
                          title: fate.title,
                          content: fate.content,
                          path: fate.path,
                        });
                        setMode("edit");
                      }}
                      title="Edit fate"
                      type="button"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      aria-label="Delete fate"
                      className={styles.iconButton}
                      onClick={() => deleteFate(fate.id)}
                      title="Delete fate"
                      type="button"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </header>
                <span className={styles.path}>{fate.path}</span>
                <p>{fate.content}</p>
              </article>
            ))}
          </div>

          {hash ? (
            <a
              className={styles.link}
              href={`https://basescan.org/tx/${hash}`}
              rel="noreferrer"
              target="_blank"
            >
              View latest transaction
            </a>
          ) : null}
        </section>
      </main>
    </div>
  );
}
