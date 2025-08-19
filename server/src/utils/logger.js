import pino from "pino";

// Console (pretty logs for dev)
const prettyTransport = {
  target: "pino-pretty",
  options: {
    colorize: true,
    translateTime: "SYS:HH:MM:ss",
    ignore: "pid,hostname",
    levelFirst: true,
  },
  level: "debug",
};

// File (JSON logs for production / analysis)
const fileTransport = {
  target: "pino/file",
  options: {
    destination: "./logs/app.log", // auto create file
    mkdir: true, // create folder if missing
  },
  level: "info", // only info+ logs in file
};

export const logger = pino({
  level: "debug",
  transport: {
    targets: [prettyTransport, fileTransport],
  },
});

// export default logger;
