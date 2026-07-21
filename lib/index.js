module.exports = {
  bot: (config, handler) => {
    return {
      name: config.pattern?.replace("?", "").trim(),

      description: config.desc,

      execute: async (ctx) => {
        const match = ctx.args.join(" ");

        return handler(
          {
            send: (text) =>
              ctx.sock.sendMessage(ctx.from, { text }, { quoted: ctx.msg }),

            ...ctx,
          },
          match,
        );
      },
    };
  },
};
