import type { Address } from "viem";

export const FATEBOOK_CONTRACT_ADDRESS =
  "0x9302e09005c359a4106Db03bbd1342cDE46ac52f" as Address;

export const FATEBOOK_ABI = [
  {
    type: "function",
    name: "createFate",
    stateMutability: "nonpayable",
    inputs: [
      { name: "title", type: "string" },
      { name: "content", type: "string" },
      { name: "path", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "editFate",
    stateMutability: "nonpayable",
    inputs: [
      { name: "fateId", type: "uint256" },
      { name: "newTitle", type: "string" },
      { name: "newContent", type: "string" },
      { name: "newPath", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "mergeFates",
    stateMutability: "nonpayable",
    inputs: [
      { name: "fateA", type: "uint256" },
      { name: "fateB", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "deleteFate",
    stateMutability: "nonpayable",
    inputs: [{ name: "fateId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "resetFateBook",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "getFate",
    stateMutability: "view",
    inputs: [
      { name: "user", type: "address" },
      { name: "fateId", type: "uint256" },
    ],
    outputs: [
      { name: "id", type: "uint256" },
      { name: "title", type: "string" },
      { name: "content", type: "string" },
      { name: "path", type: "string" },
      { name: "mergeCount", type: "uint256" },
      { name: "createdAt", type: "uint256" },
      { name: "exists", type: "bool" },
    ],
  },
  {
    type: "function",
    name: "fateCount",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "interactionCount",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;
