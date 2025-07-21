import { UAParser } from "ua-parser-js";

export function parseDevice(userAgent) {
  const parser = new UAParser(userAgent);
  const device = parser.getDevice()?.model;
  const os = parser.getOS()?.name;
  const browser = parser.getBrowser()?.name;

  return { device, os, browser };
}
