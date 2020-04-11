<template>
  <a-layout id="components-layout-demo-fixed-sider">
    <a-layout-sider
      theme="light"
      :style="{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0 , borderRight: '1px #CCC solid'}"
    >
      <RedisKeyTree />
    </a-layout-sider>
    <a-layout :style="{ marginLeft: '200px' , backgroundColor: 'white'}">
      <a-layout-content
        :style="{ 
          margin: '24px 16px 0', 
          overflow: 'initial', 
          fontSize: '16px', 
          fontFamily: 'consolas,monospace' 
        }"
      >
        <EntryDetail />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
<script>
import RedisKeyTree from "./RedisKeyTree";
import EntryDetail from "./EntryDetail";
export default {
  components: { RedisKeyTree, EntryDetail },

  method: {}
};
</script>