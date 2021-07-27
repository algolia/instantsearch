<template>
  <div>
    <router-link to="/">Home</router-link>|
    <router-link to="/about">About</router-link>
    <router-view v-slot="{ Component }">
      <Suspense>
        <component :is="Component" />
      </Suspense>
    </router-view>
  </div>
</template>
