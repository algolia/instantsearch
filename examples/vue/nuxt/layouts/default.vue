<template>
  <div>
    <div id="nav">
      <nuxt-link to="/">Home</nuxt-link> |
      <nuxt-link to="/search">Search</nuxt-link>
    </div>
    <nuxt />
  </div>
</template>

<style>
html {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

*,
*:before,
*:after {
  box-sizing: border-box;
}

#nav {
  text-align: center;
}
</style>
