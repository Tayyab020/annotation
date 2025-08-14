export default {
  presets: [
    ["@babel/preset-react", { 
      runtime: "automatic",
      development: true 
    }]
  ],
  plugins: [
    ["@locator/babel-jsx/dist", {
      env: "development",
    }]
  ],
};
