<template>
  <div>
    <h1>{{ page.title }}</h1>
    <nuxt-content :document="page" />
  </div>
</template>

<script>
export default {
  async asyncData({ params, $content }) {

    const page = await $content(params.name).fetch();

    return {
      page
    };
  }
};
</script>

<style scoped>

</style>
