<template>
  <div class="app-shell">
    <div class="page-bg is-empty" aria-hidden="true"></div>
    <div class="page-bg-veil" aria-hidden="true"></div>
    <header class="topbar">
      <div class="visor topbar__inner">
        <RouterLink class="brand" to="/">NecoOcean</RouterLink>
        <nav class="topbar__nav" aria-label="主导航">
          <RouterLink to="/">工具</RouterLink>
          <RouterLink to="/about">关于</RouterLink>
          <RouterLink to="/privacy">隐私</RouterLink>
        </nav>
      </div>
    </header>
    <main class="main">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
</script>
