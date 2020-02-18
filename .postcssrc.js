// https://github.com/michael-ciniawsky/postcss-load-config

module.exports = {
  plugins: {
    autoprefixer: {},
    "postcss-pxtorem": {
      "rootValue": 75,
      "propList": ["*"]
    }
  }
};
