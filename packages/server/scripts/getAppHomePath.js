const appHome = process.env.APP_HOME;
if (!appHome) {
  throw new Error("APP_HOME env should be configured");
}

export default appHome;
