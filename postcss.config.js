export default {
  plugins: {
    autoprefixer: {
      overrideBrowserslist: [
        "> 1%",
        "last 2 versions",
        "not dead",
        "not ie 11",
      ],
    },

    // CSS Minification
    cssnano: {
      preset: "default",
      discardComments: {
        removeAll: true,
      },
      normalizeWhitespace: false,
    },
  },
};
