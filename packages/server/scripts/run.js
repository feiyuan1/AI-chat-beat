import { spawn } from "child_process";

const run = async (cmd, args, options) => {
  return new Promise((res, rej) => {
    const child = spawn(cmd, args, {
      shell: process.platform === "win32",
      stdio: "inherit",
      ...options,
    });
    child.on("exit", (code) => {
      if (code === 0) {
        res();
      } else {
        rej(new Error(`Process exited with code ${code}`));
      }
    });
    child.on("error", (err) => {
      rej(err);
    });
  });
};

export default run;
