module.exports = {
  content: [
    "./index.html",
    "./script.js",
    {
      raw: String(
        (() => {
          const script = require("fs").readFileSync("./script.js", "utf8");
          const classes = script.match(/class="([^"]+)"/g);
          return classes ? classes.join(" ") : "";
        })()
      ),
    },
  ],
  theme: {
    extend: {
      colors: {
        "orange-soda": "#F35A3F",
        cherokee: "#F5CE85",
        marigold: "#E99D21",
        "eerie-black": "#1C1C20",
        "black-haze": "#DFDFD6",
      },
      fontFamily: {
        "dm-sans": ["DM Sans", "sans-serif"],
      },
    },
  },
  safelist: [
    "mb-8",
    "p-4",
    "border",
    "border-gray-200",
    "rounded-lg",
    "shadow-sm",
    "bg-white",
    "text-lg",
    "uppercase",
    "font-bold",
    "mb-2",
    "text-gray-800",
    "text-sm",
    "text-gray-600",
    "mt-2",
    "prose",
    "prose-sm",
  ],
  plugins: [],
};
