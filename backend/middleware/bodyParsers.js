import express from "express";

export const jsonParser = express.json({ limit: "10mb" });