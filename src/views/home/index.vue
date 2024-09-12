<template>
    asdsd
</template>
  
<script>
import { saveNavPath } from '@/utils/common.js'
export default {
    name: 'HomeIndex',
    components: {},
    props: {},
    data() {
      return {
        userInfo: {},
      }
    },
    methods: {

    },
    created() {
        saveNavPath('/users')
        this.$router.push({ name: 'users' })
    }
}
</script>
  
<style scoped lang="less">
  div {
    height: 98%;
  }
</style>
  